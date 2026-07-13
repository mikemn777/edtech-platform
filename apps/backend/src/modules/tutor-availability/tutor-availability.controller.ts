import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { TutorAvailabilityService } from './application/tutor-availability.service';
import { CreateAvailabilityDto } from './contracts/availability.dto';
import { CurrentUser, Public } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2_PERMISSIONS } from '../../shared/permission/permission-keys.phase2';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('tutor-availability')
@Controller({ path: 'tutors/:tutorId/availability', version: '1' })
export class TutorAvailabilityController {
  constructor(private readonly availability: TutorAvailabilityService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List a tutor’s active availability windows' })
  async list(@Param('tutorId') tutorId: string) {
    return this.availability.list(tutorId);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_AVAILABILITY_MANAGE)
  @ApiOperation({ summary: 'Add an availability window' })
  async create(
    @Param('tutorId') tutorId: string,
    @Body() dto: CreateAvailabilityDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.availability.create(tutorId, dto, actor, req.correlationId);
  }

  @Delete(':availabilityId')
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.TUTOR_AVAILABILITY_MANAGE)
  @ApiOperation({ summary: 'Cancel an availability window (that tutor, or staff, only)' })
  async cancel(
    @Param('availabilityId') availabilityId: string,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.availability.cancel(availabilityId, actor, req.correlationId);
  }
}
