import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './application/auth.service';
import { PasswordHasher } from './adapters/password-hasher';
import { TokenService } from './adapters/token.service';

/**
 * Authentication module (module 10). Exports TokenService so the global
 * JwtAuthGuard (registered in AuthorizationModule) can verify access tokens.
 */
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, PasswordHasher, TokenService],
  exports: [TokenService, AuthService],
})
export class AuthModule {}
