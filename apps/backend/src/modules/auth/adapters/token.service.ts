import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import { AppConfigService } from '../../../platform/config/app-config.service';

export interface AccessTokenClaims {
  sub: string; // account id
  identityId: string;
  roles: string[];
  permissions: string[];
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

/**
 * Token issuance/verification (module 10). Access tokens are short-lived and
 * carry the flattened permission set for stateless authorization; refresh
 * tokens are opaque, hashed at rest in AuthSession (Blueprint §11).
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async issue(claims: AccessTokenClaims): Promise<IssuedTokens> {
    const accessExpiresIn = this.config.get('JWT_ACCESS_TTL');
    const refreshExpiresIn = this.config.get('JWT_REFRESH_TTL');
    const refreshTokenId = randomUUID();

    const accessToken = await this.jwt.signAsync(claims, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiresIn,
    });

    // Opaque refresh token (id + secret material); only its hash is persisted.
    const refreshSecret = randomUUID();
    const refreshToken = `${refreshTokenId}.${refreshSecret}`;

    return { accessToken, refreshToken, refreshTokenId, accessExpiresIn, refreshExpiresIn };
  }

  async verifyAccess(token: string): Promise<AccessTokenClaims> {
    return this.jwt.verifyAsync<AccessTokenClaims>(token, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
    });
  }

  /** Deterministic hash for storing/comparing refresh tokens (never store raw). */
  hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  parseRefreshToken(refreshToken: string): { id: string } | null {
    const [id] = refreshToken.split('.');
    return id ? { id } : null;
  }
}
