import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import { PasswordHasher } from '../adapters/password-hasher';
import { TokenService, IssuedTokens } from '../adapters/token.service';
import type { RegisterDto, LoginDto } from '../contracts/auth.dto';

/**
 * Authentication service (module 10). Registration, login, refresh, logout.
 * Every attempt is recorded to the append-only AuthEvent + AuditRecord
 * (Art. 6.5). Failures are generic to avoid user enumeration (Blueprint §17).
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  async register(dto: RegisterDto, correlationId?: string): Promise<{ accountId: string }> {
    const email = dto.email.toLowerCase().trim();

    // findFirst, not findUnique: primaryEmail is no longer a plain @unique — a
    // soft-deleted identity must not block re-registration with the same email
    // (P0-2; uniqueness among live rows is enforced by a partial index instead).
    const existing = await this.prisma.identity.findFirst({ where: { primaryEmail: email, isDeleted: false } });
    if (existing) {
      // Do not reveal existence; conflict is generic.
      throw DomainError.conflict('Unable to register with the provided details.');
    }

    const secretReference = await this.hasher.hash(dto.password);

    const account = await this.prisma.$transaction(async (tx) => {
      const identity = await tx.identity.create({ data: { primaryEmail: email } });
      await tx.authCredential.create({
        data: { identityId: identity.id, method: 'PASSWORD', secretReference },
      });
      return tx.userAccount.create({
        data: { identityId: identity.id, displayName: dto.displayName },
      });
    });

    await this.audit.record({
      actorAccountId: account.id,
      action: 'auth.register',
      entityType: 'UserAccount',
      entityReference: account.id,
      classification: 'personal',
      correlationId,
    });

    return { accountId: account.id };
  }

  async login(dto: LoginDto, correlationId?: string): Promise<IssuedTokens> {
    const email = dto.email.toLowerCase().trim();
    const identity = await this.prisma.identity.findFirst({
      where: { primaryEmail: email, isDeleted: false },
      include: { credentials: { where: { method: 'PASSWORD', isDeleted: false } }, account: true },
    });

    const credential = identity?.credentials[0];
    const ok = credential ? await this.hasher.verify(credential.secretReference, dto.password) : false;

    if (!identity || !identity.account || !ok || identity.status !== 'ACTIVE') {
      await this.recordAuthEvent(identity?.id, 'login', 'failure', correlationId);
      // Generic failure — no enumeration (Blueprint §17).
      throw DomainError.unauthenticated('Invalid credentials.');
    }

    const tokens = await this.issueSession(identity.account.id, identity.id, correlationId);
    await this.recordAuthEvent(identity.id, 'login', 'success', correlationId);
    return tokens;
  }

  async refresh(refreshToken: string, correlationId?: string): Promise<IssuedTokens> {
    const parsed = this.tokens.parseRefreshToken(refreshToken);
    if (!parsed) throw DomainError.unauthenticated('Invalid refresh token.');

    const hash = this.tokens.hashRefreshToken(refreshToken);
    const session = await this.prisma.authSession.findFirst({
      where: { id: parsed.id, status: 'ACTIVE', isDeleted: false },
      include: { identity: { include: { account: true } } },
    });

    if (
      !session ||
      session.refreshTokenHash !== hash ||
      session.expiresAt < new Date() ||
      !session.identity.account
    ) {
      throw DomainError.unauthenticated('Session is no longer valid.');
    }

    // Rotate: revoke the old session, issue a new one (refresh-token rotation).
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { status: 'REVOKED' },
    });

    return this.issueSession(session.identity.account.id, session.identityId, correlationId);
  }

  async logout(refreshToken: string, correlationId?: string): Promise<void> {
    const parsed = this.tokens.parseRefreshToken(refreshToken);
    if (!parsed) return; // idempotent — nothing to do
    const hash = this.tokens.hashRefreshToken(refreshToken);
    const session = await this.prisma.authSession.findFirst({
      where: { id: parsed.id, refreshTokenHash: hash, status: 'ACTIVE' },
    });
    if (session) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { status: 'REVOKED' },
      });
      await this.recordAuthEvent(session.identityId, 'logout', 'success', correlationId);
    }
  }

  private async issueSession(
    accountId: string,
    identityId: string,
    correlationId?: string,
  ): Promise<IssuedTokens> {
    // Load the flattened permission set for the account's roles (RBAC).
    const permissions = await this.resolvePermissions(accountId);
    const roles = await this.resolveRoles(accountId);

    const issued = await this.tokens.issue({ sub: accountId, identityId, roles, permissions });
    const expiresAt = new Date(Date.now() + issued.refreshExpiresIn * 1000);

    await this.prisma.authSession.create({
      data: {
        id: issued.refreshTokenId,
        identityId,
        refreshTokenHash: this.tokens.hashRefreshToken(issued.refreshToken),
        expiresAt,
      },
    });

    await this.audit.record({
      actorAccountId: accountId,
      action: 'auth.session.issued',
      entityType: 'AuthSession',
      entityReference: issued.refreshTokenId,
      classification: 'personal',
      correlationId,
    });

    return issued;
  }

  private async resolveRoles(accountId: string): Promise<string[]> {
    const rows = await this.prisma.accountRole.findMany({
      where: { accountId, isDeleted: false },
      include: { role: true },
    });
    return rows.map((r) => r.role.name);
  }

  private async resolvePermissions(accountId: string): Promise<string[]> {
    const rows = await this.prisma.accountRole.findMany({
      where: { accountId, isDeleted: false },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });
    const perms = new Set<string>();
    for (const ar of rows) {
      for (const rp of ar.role.rolePermissions) perms.add(rp.permission.key);
    }
    return [...perms];
  }

  private async recordAuthEvent(
    identityId: string | undefined,
    eventType: string,
    outcome: string,
    correlationId?: string,
  ): Promise<void> {
    await this.prisma.authEvent.create({
      data: { identityId: identityId ?? null, eventType, outcome, context: { correlationId } },
    });
  }
}
