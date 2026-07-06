import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { TutorVerificationService } from './application/tutor-verification.service';
import { DecideVerificationDto, OpenVerificationCaseDto } from './contracts/verification.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2_PERMISSIONS } from '../../shared/permission/permission-keys.phase2';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

/** Tutor Verification endpoints (operational — Moderator/Admin; Roles §12). */
@ApiTags('tutor-verification')
@ApiBearerAuth('access-token')
@Controller({ path: 'tutor-verification', version: '1' })
export class TutorVerificationController {
  constructor(private readonly verification: TutorVerificationService) {}

  @Get('queue')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_VERIFICATION_READ)
  @ApiOperation({ summary: 'List tutors with verification status (admin queue)' })
  async queue() {
    return this.verification.listQueue();
  }

  @Post('tutors/:tutorId/cases')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_VERIFICATION_MANAGE)
  @ApiOperation({ summary: 'Open a verification case for a tutor' })
  async open(
    @Param('tutorId') tutorId: string,
    @Body() dto: OpenVerificationCaseDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.verification.openCase(tutorId, dto.jurisdictionId, actor.accountId, req.correlationId);
  }

  @Post('cases/:caseId/decision')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_VERIFICATION_DECIDE)
  @ApiOperation({ summary: 'Approve or reject a verification case (high-risk, audited)' })
  async decide(
    @Param('caseId') caseId: string,
    @Body() dto: DecideVerificationDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.verification.decide(caseId, dto.decision, dto.notes, actor.accountId, req.correlationId);
  }

  @Post('tutors/:tutorId/revoke')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_VERIFICATION_DECIDE)
  @ApiOperation({ summary: 'Revoke a tutor’s verification (deactivates offerings)' })
  async revoke(
    @Param('tutorId') tutorId: string,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.verification.revoke(tutorId, actor.accountId, req.correlationId);
  }
}
