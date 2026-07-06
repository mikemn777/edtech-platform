import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from './authz.decorators';

/**
 * String-based permission requirement decorator (additive to Phase 1).
 *
 * The Phase 1 `@RequirePermissions` is typed to the Phase 1 key union; this
 * variant accepts any permission key string so Phase 2+ catalogs can be used
 * without modifying the Phase 1 decorator. It writes the SAME metadata key, so
 * the existing PermissionsGuard enforces it unchanged (deny-by-default holds).
 */
export const RequirePermissionKeys = (
  ...permissions: string[]
): MethodDecorator & ClassDecorator => SetMetadata(PERMISSIONS_KEY, permissions);
