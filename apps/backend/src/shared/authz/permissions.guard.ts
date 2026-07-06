import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERMISSIONS_KEY } from './authz.decorators';
import { PolicyService } from './policy.service';
import { DomainError } from '../../platform/errors/domain-error';
import type { PermissionKey } from '../permission/permission-keys';
import type { AuthenticatedPrincipal } from '../identity/request-context';

/**
 * Authorization guard (module 11; Roles §15-16). Enforces the explicit
 * permissions declared via @RequirePermissions. Deny-by-default: if permissions
 * are required and the principal lacks any, access is denied and the reason is
 * surfaced as FORBIDDEN. Reasoned centrally via PolicyService (§15.8).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly policy: PolicyService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { principal?: AuthenticatedPrincipal }>();

    if (!this.policy.hasAllPermissions(request.principal, required)) {
      throw DomainError.forbidden();
    }
    return true;
  }
}
