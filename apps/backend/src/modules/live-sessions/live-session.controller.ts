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
  @ApiOperation({ summary: 'Create a live session (the verified tutor themselves, or admin)' })
  create(@Body() dto: CreateLiveSessionDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.sessions.create(dto, a, r.correlationId);
  }

  @Post(':id/start')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_MANAGE)
  @ApiOperation({ summary: 'Start a session (the assigned tutor, or admin; allocates a media room via the video port)' })
  start(@Param('id') id: string, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.sessions.start(id, a, r.correlationId);
  }

  @Post(':id/join')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_JOIN)
  @ApiOperation({ summary: 'Join an in-progress session (assigned tutor/student/guardian only; records attendance, returns opaque media grant)' })
  join(@Param('id') id: string, @CurrentUser() a: AuthenticatedPrincipal) {
    return this.sessions.join(id, a);
  }

  @Post(':id/complete')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_MANAGE)
  @ApiOperation({ summary: 'Complete a session (the assigned tutor, or admin)' })
  complete(@Param('id') id: string, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.sessions.transition(id, 'COMPLETED', a, r.correlationId);
  }

  @Post(':id/cancel')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.LIVE_SESSION_MANAGE)
  @ApiOperation({ summary: 'Cancel a session (the assigned tutor, or admin)' })
  cancel(@Param('id') id: string, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.sessions.transition(id, 'CANCELLED', a, r.correlationId);
  }
}
