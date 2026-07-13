import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TutorDashboardService } from './application/tutor-dashboard.service';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2B_PERMISSIONS } from '../../shared/permission/permission-keys.phase2b';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('tutor-dashboard')
@ApiBearerAuth('access-token')
@Controller({ path: 'tutors/:tutorId/dashboard', version: '1' })
export class TutorDashboardController {
  constructor(private readonly dashboard: TutorDashboardService) {}

  @Get()
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.TUTOR_DASHBOARD_READ)
  @ApiOperation({ summary: 'Tutor dashboard summary (that tutor, or staff, only)' })
  summary(@Param('tutorId') tutorId: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.dashboard.summary(tutorId, actor);
  }
}
