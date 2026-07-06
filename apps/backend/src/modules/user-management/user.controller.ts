import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserService } from './application/user.service';
import { AssignRoleDto, UpdateAccountDto } from './contracts/user.dto';
import { PaginationQueryDto } from '../../shared/pagination/pagination.dto';
import { CurrentUser, RequirePermissions } from '../../shared/authz/authz.decorators';
import { PERMISSIONS } from '../../shared/permission/permission-keys';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

/** User Management endpoints (module 12). All require explicit permissions. */
@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ApiOperation({ summary: 'List accounts (paginated)' })
  async list(@Query() q: PaginationQueryDto) {
    return this.users.list(q.page, q.pageSize, q.skip);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ApiOperation({ summary: 'Get an account by id' })
  async get(@Param('id') id: string) {
    return this.users.findById(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ApiOperation({ summary: 'Update an account' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ): Promise<{ status: string }> {
    await this.users.update(id, dto, actor.accountId, req.correlationId);
    return { status: 'updated' };
  }

  @Post(':id/roles')
  @RequirePermissions(PERMISSIONS.ROLE_ASSIGN)
  @ApiOperation({ summary: 'Assign a role to an account (high-risk, audited)' })
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ): Promise<{ status: string }> {
    await this.users.assignRole(id, dto.role, actor.accountId, req.correlationId);
    return { status: 'assigned' };
  }
}
