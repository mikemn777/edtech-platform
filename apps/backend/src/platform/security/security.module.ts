import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

/**
 * Security middleware/guards (Blueprint §17, §29; System Architecture §23, §28.4).
 * - Rate limiting at the edge (abuse protection).
 * - Helmet is applied in main.ts (secure headers).
 * Authorization (RBAC) guards are registered by the authorization module.
 */
@Module({
  imports: [
    // Rate limits. The default is generous so a normal single-page app (which
    // makes several API calls per screen) is never throttled during use; auth
    // stays tighter to resist brute-force. Tune down for production hardening.
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 1000 },
      { name: 'auth', ttl: 60_000, limit: 30 },
    ]),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class SecurityModule {}
