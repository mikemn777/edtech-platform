import { Body, Controller, Get, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SettingsService } from './application/settings.service';
import { UpsertSettingDto, ConfigScopeDto } from './contracts/setting.dto';
import { CurrentUser, RequirePermissions } from '../../shared/authz/authz.decorators';
import { PERMISSIONS } from '../../shared/permission/permission-keys';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('settings')
@ApiBearerAuth('access-token')
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SETTING_READ)
  @ApiOperation({ summary: 'Resolve a setting value for a scope' })
  async resolve(
    @Query('key') key: string,
    @Query('scopeType') scopeType: ConfigScopeDto,
    @Query('scopeReference') scopeReference?: string,
  ) {
    return { value: await this.settings.resolve(key, scopeType, scopeReference) };
  }

  @Put()
  @RequirePermissions(PERMISSIONS.SETTING_MANAGE)
  @ApiOperation({ summary: 'Create or update a setting (governed, audited)' })
  async upsert(
    @Body() dto: UpsertSettingDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.settings.upsert(dto, actor.accountId, req.correlationId);
  }
}
