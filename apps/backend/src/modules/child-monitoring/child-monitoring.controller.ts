import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ChildMonitoringService } from './application/child-monitoring.service';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2B_PERMISSIONS } from '../../shared/permission/permission-keys.phase2b';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('child-monitoring')
@ApiBearerAuth('access-token')
@Controller({ path: 'parents/:parentAccountId/children', version: '1' })
export class ChildMonitoringController {
  constructor(private readonly monitoring: ChildMonitoringService) {}

  @Get(':studentAccountId/monitor')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.CHILD_MONITOR_READ)
  @ApiOperation({
    summary: 'Monitor a linked child (requires ACTIVE guardianship; oversight rules PBD)',
  })
  monitor(
    @Param('parentAccountId') parentAccountId: string,
    @Param('studentAccountId') studentAccountId: string,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.monitoring.monitorChild(
      parentAccountId,
      studentAccountId,
      actor.accountId,
      req.correlationId,
    );
  }
}
