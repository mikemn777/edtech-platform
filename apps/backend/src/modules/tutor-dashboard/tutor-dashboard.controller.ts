import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TutorDashboardService } from './application/tutor-dashboard.service';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2B_PERMISSIONS } from '../../shared/permission/permission-keys.phase2b';

@ApiTags('tutor-dashboard')
@ApiBearerAuth('access-token')
@Controller({ path: 'tutors/:tutorId/dashboard', version: '1' })
export class TutorDashboardController {
  constructor(private readonly dashboard: TutorDashboardService) {}

  @Get()
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.TUTOR_DASHBOARD_READ)
  @ApiOperation({ summary: 'Tutor dashboard summary (own operational state)' })
  summary(@Param('tutorId') tutorId: string) {
    return this.dashboard.summary(tutorId);
  }
}
