import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RelationshipService } from './application/relationship.service';
import { CreateGuardianshipDto } from './contracts/relationship.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2_PERMISSIONS } from '../../shared/permission/permission-keys.phase2';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('relationships')
@ApiBearerAuth('access-token')
@Controller({ path: 'relationships', version: '1' })
export class RelationshipController {
  constructor(private readonly relationships: RelationshipService) {}

  @Post('guardianships')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.RELATIONSHIP_MANAGE)
  @ApiOperation({
    summary: 'Create a guardianship link (created PENDING; oversight rules are PBD)',
  })
  async create(
    @Body() dto: CreateGuardianshipDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.relationships.createGuardianship(
      dto.parentAccountId,
      dto.studentAccountId,
      actor.accountId,
      req.correlationId,
    );
  }

  @Get('parents/:parentAccountId/guardianships')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.RELATIONSHIP_READ)
  @ApiOperation({ summary: 'List guardianship links for a parent account' })
  async list(@Param('parentAccountId') parentAccountId: string) {
    return this.relationships.listForParent(parentAccountId);
  }
}
