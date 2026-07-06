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
    return this.learning.createGoal(studentId, dto, actor.accountId, req.correlationId);
  }

  @Get('goals')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_GOAL_READ)
  @ApiOperation({ summary: 'List learning goals' })
  listGoals(@Param('studentId') studentId: string) {
    return this.learning.listGoals(studentId);
  }

  @Patch('goals/:goalId/status')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_GOAL_MANAGE)
  @ApiOperation({ summary: 'Update a goal status' })
  setGoalStatus(
    @Param('goalId') goalId: string,
    @Body() dto: UpdateGoalStatusDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.learning.setGoalStatus(goalId, dto.status, actor.accountId, req.correlationId);
  }

  @Post('progress')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_PROGRESS_MANAGE)
  @ApiOperation({ summary: 'Record a progress entry' })
  recordProgress(
    @Param('studentId') studentId: string,
    @Body() dto: RecordProgressDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.learning.recordProgress(studentId, dto, actor.accountId, req.correlationId);
  }

  @Get('progress')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.STUDENT_PROGRESS_READ)
  @ApiOperation({ summary: 'List progress entries' })
  listProgress(@Param('studentId') studentId: string) {
    return this.learning.listProgress(studentId);
  }
}
