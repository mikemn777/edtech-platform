import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './application/auth.service';
import { AuthTokensResponse, LoginDto, RefreshDto, RegisterDto } from './contracts/auth.dto';
import { Public } from '../../shared/authz/authz.decorators';

/**
 * Authentication endpoints (module 10). All are public (pre-authentication) but
 * rate-limited (Blueprint §17, §29). Correlation id flows from middleware.
 */
@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiResponse({ status: 201 })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request & { correlationId?: string },
  ): Promise<{ accountId: string }> {
    return this.auth.register(dto, req.correlationId);
  }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive tokens' })
  @ApiResponse({ status: 200, type: AuthTokensResponse })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request & { correlationId?: string },
  ): Promise<AuthTokensResponse> {
    return this.auth.login(dto, req.correlationId);
  }

  @Public()
  @Throttle({ auth: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate tokens using a refresh token' })
  @ApiResponse({ status: 200, type: AuthTokensResponse })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request & { correlationId?: string },
  ): Promise<AuthTokensResponse> {
    return this.auth.refresh(dto.refreshToken, req.correlationId);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a session (idempotent)' })
  async logout(
    @Body() dto: RefreshDto,
    @Req() req: Request & { correlationId?: string },
  ): Promise<void> {
    await this.auth.logout(dto.refreshToken, req.correlationId);
  }
}
