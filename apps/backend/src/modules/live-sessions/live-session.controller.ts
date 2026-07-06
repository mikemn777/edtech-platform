import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { LiveSessionService } from './application/live-session.service';
import { CreateLiveSessionDto } from './contracts/live-session.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE3_PERMISSIONS } from '../../shared/permission/permission-keys.phase3';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('live-sessions')
@ApiBearerAuth('access-token')
@Controller({ path: 'live-sessions', version: '1' })
export class LiveSessionController {
  constructor(private readonly sessions: LiveSessionService) {}

  @Post()
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_MANAGE)
  @ApiOperation({ summary: 'Create a live session (verified tutors only)' })
  create(@Body() dto: CreateLiveSessionDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.sessions.create(dto, a.accountId, r.correlationId);
  }

  @Post(':id/start')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_MANAGE)
  @ApiOperation({ summary: 'Start a session (allocates a media room via the video port)' })
  start(@Param('id') id: string, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.sessions.start(id, a.accountId, r.correlationId);
  }

  @Post(':id/join')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_JOIN)
  @ApiOperation({ summary: 'Join an in-progress session (records attendance, returns opaque media grant)' })
  join(@Param('id') id: string, @CurrentUser() a: AuthenticatedPrincipal) {
    return this.sessions.join(id, a.accountId);
  }

  @Post(':id/complete')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_MANAGE)
  @ApiOperation({ summary: 'Complete a session' })
  complete(@Param('id') id: string, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.sessions.transition(id, 'COMPLETED', a.accountId, r.correlationId);
  }

  @Post(':id/cancel')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_MANAGE)
  @ApiOperation({ summary: 'Cancel a session' })
  cancel(@Param('id') id: string, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.sessions.transition(id, 'CANCELLED', a.accountId, r.correlationId);
  }
}
