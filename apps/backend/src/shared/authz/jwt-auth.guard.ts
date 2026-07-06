import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './authz.decorators';
import { TokenService } from '../../modules/auth/adapters/token.service';
import { DomainError } from '../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../identity/request-context';
import { PermissionScope } from '@edu/types';

/**
 * Global authentication guard (Blueprint §4.4; Roles §12.2). Every route requires
 * a valid access token UNLESS explicitly marked @Public. Fails closed (§16.8):
 * any error resolves to denial. On success it attaches the principal to req.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { principal?: AuthenticatedPrincipal }>();

    const header = request.header('authorization');
    if (!header || !header.startsWith('Bearer ')) {
      throw DomainError.unauthenticated();
    }
    const token = header.slice('Bearer '.length).trim();

    try {
      const claims = await this.tokens.verifyAccess(token);
      request.principal = {
        accountId: claims.sub,
        identityId: claims.identityId,
        roles: claims.roles ?? [],
        permissions: claims.permissions ?? [],
        scopes: [{ type: PermissionScope.PLATFORM }],
      };
      return true;
    } catch {
      throw DomainError.unauthenticated('Invalid or expired token.');
    }
  }
}
