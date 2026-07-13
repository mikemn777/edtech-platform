import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentProgressService } from './application/student-progress.service';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE3_PERMISSIONS } from '../../shared/permission/permission-keys.phase3';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('student-progress')
@ApiBearerAuth('access-token')
@Controller({ path: 'progress/students/:studentId', version: '1' })
export class StudentProgressController {
  constructor(private readonly progress: StudentProgressService) {}

  @Get('summary')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.PROGRESS_READ)
  @ApiOperation({ summary: 'Aggregated progress view: enrollments, homework, quizzes, goals, certificates (own profile, an active guardian, or staff)' })
  summary(@Param('studentId') studentId: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.progress.summary(studentId, actor);
  }
}
