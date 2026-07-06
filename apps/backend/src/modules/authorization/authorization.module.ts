import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../../shared/authz/jwt-auth.guard';
import { PermissionsGuard } from '../../shared/authz/permissions.guard';
import { PolicyService } from '../../shared/authz/policy.service';

/**
 * Authorization module (module 11). Registers the global authentication and
 * RBAC guards in order: authenticate first, then enforce permissions
 * (Roles doc §12.2, §15). Deny-by-default across the whole API.
 */
@Global()
@Module({
  imports: [AuthModule],
  providers: [
    PolicyService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [PolicyService],
})
export class AuthorizationModule {}
