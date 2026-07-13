import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { LearningService } from './application/learning.service';
import { CreateGoalDto, RecordProgressDto, UpdateGoalStatusDto } from './contracts/learning.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2B_PERMISSIONS } from '../../shared/permission/permission-keys.phase2b';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

/** Learning Goals + Progress Tracking (Business Domain Model §12-13). */
@ApiTags('learning')
@ApiBearerAuth('access-token')
@Controller({ path: 'students/:studentId', version: '1' })
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Post('goals')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_GOAL_MANAGE)
  @ApiOperation({ summary: 'Create a learning goal' })
  createGoal(
    @Param('studentId') studentId: string,
    @Body() dto: CreateGoalDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.learning.createGoal(studentId, dto, actor, req.correlationId);
  }

  @Get('goals')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_GOAL_READ)
  @ApiOperation({ summary: 'List learning goals (own profile, an active guardian, or staff)' })
  listGoals(@Param('studentId') studentId: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.learning.listGoals(studentId, actor);
  }

  @Patch('goals/:goalId/status')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_GOAL_MANAGE)
  @ApiOperation({ summary: 'Update a goal status (own profile, an active guardian, or staff)' })
  setGoalStatus(
    @Param('goalId') goalId: string,
    @Body() dto: UpdateGoalStatusDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.learning.setGoalStatus(goalId, dto.status, actor, req.correlationId);
  }

  @Post('progress')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_PROGRESS_MANAGE)
  @ApiOperation({ summary: 'Record a progress entry (own profile, an active guardian, or staff)' })
  recordProgress(
    @Param('studentId') studentId: string,
    @Body() dto: RecordProgressDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.learning.recordProgress(studentId, dto, actor, req.correlationId);
  }

  @Get('progress')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_PROGRESS_READ)
  @ApiOperation({ summary: 'List progress entries (own profile, an active guardian, or staff)' })
  listProgress(@Param('studentId') studentId: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.learning.listProgress(studentId, actor);
  }
}
