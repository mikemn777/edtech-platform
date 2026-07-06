import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { TutorService } from './application/tutor.service';
import {
  CreateOfferingDto,
  CreateTutorProfileDto,
  UpdateOfferingStatusDto,
  UpdateTutorProfileDto,
} from './contracts/tutor.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2_PERMISSIONS } from '../../shared/permission/permission-keys.phase2';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

/** Tutor self-management endpoints (Business Domain Model §5). */
@ApiTags('tutors')
@ApiBearerAuth('access-token')
@Controller({ path: 'tutors', version: '1' })
export class TutorController {
  constructor(private readonly tutors: TutorService) {}

  @Post('profiles')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Create a tutor profile (starts unverified)' })
  async createProfile(
    @Body() dto: CreateTutorProfileDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.tutors.createProfile(dto, actor.accountId, req.correlationId);
  }

  @Get('profiles/me')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_PROFILE_READ)
  @ApiOperation({ summary: 'Get the current user’s tutor profile (null if none)' })
  async mine(@CurrentUser() actor: AuthenticatedPrincipal) {
    try {
      return await this.tutors.getByAccount(actor.accountId);
    } catch {
      return null;
    }
  }

  @Get('profiles/:id')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_PROFILE_READ)
  @ApiOperation({ summary: 'Get a tutor profile by id (authenticated view)' })
  async getProfile(@Param('id') id: string) {
    return this.tutors.getProfileById(id);
  }

  @Patch('profiles/:id')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Update a tutor profile' })
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateTutorProfileDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.tutors.updateProfile(id, dto, actor.accountId, req.correlationId);
  }

  @Post('profiles/:id/offerings')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_OFFERING_MANAGE)
  @ApiOperation({ summary: 'Create an offering for a tutor' })
  async createOffering(
    @Param('id') tutorId: string,
    @Body() dto: CreateOfferingDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.tutors.createOffering(tutorId, dto, actor.accountId, req.correlationId);
  }

  @Patch('offerings/:offeringId/status')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_OFFERING_MANAGE)
  @ApiOperation({ summary: 'Change offering status (activation requires verification)' })
  async setOfferingStatus(
    @Param('offeringId') offeringId: string,
    @Body() dto: UpdateOfferingStatusDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.tutors.setOfferingStatus(offeringId, dto.status, actor.accountId, req.correlationId);
  }
}