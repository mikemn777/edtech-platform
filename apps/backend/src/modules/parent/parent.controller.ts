import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ParentService } from './application/parent.service';
import { CreateParentProfileDto, UpdateParentProfileDto } from './contracts/parent.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2_PERMISSIONS } from '../../shared/permission/permission-keys.phase2';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('parents')
@ApiBearerAuth('access-token')
@Controller({ path: 'parents', version: '1' })
export class ParentController {
  constructor(private readonly parents: ParentService) {}

  @Post('profiles')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.PARENT_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Create a parent profile' })
  async create(
    @Body() dto: CreateParentProfileDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.parents.create(dto, actor.accountId, req.correlationId);
  }

  @Get('profiles/:id')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.PARENT_PROFILE_READ)
  @ApiOperation({ summary: 'Get a parent profile by id' })
  async get(@Param('id') id: string) {
    return this.parents.getById(id);
  }

  @Patch('profiles/:id')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.PARENT_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Update a parent profile' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateParentProfileDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.parents.update(id, dto, actor.accountId, req.correlationId);
  }
}
