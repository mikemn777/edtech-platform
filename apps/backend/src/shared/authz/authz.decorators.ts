import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Request } from 'express';
import type { PermissionKey } from '../permission/permission-keys';
import type { AuthenticatedPrincipal } from '../identity/request-context';

/** Marks a route as not requiring authentication (deny-by-default otherwise). */
export const IS_PUBLIC_KEY = 'authz:isPublic';
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

/** Declares the explicit permissions required to invoke a handler (Roles §15.2). */
export const PERMISSIONS_KEY = 'authz:permissions';
export const RequirePermissions = (
  ...permissions: PermissionKey[]
): MethodDecorator & ClassDecorator => SetMetadata(PERMISSIONS_KEY, permissions);

/** Injects the authenticated principal resolved by the JWT guard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedPrincipal | undefined => {
    const request = ctx.switchToHttp().getRequest<Request & { principal?: AuthenticatedPrincipal }>();
    return request.principal;
  },
);
