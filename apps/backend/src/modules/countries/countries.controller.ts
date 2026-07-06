import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CountriesService } from './application/countries.service';
import { CreateCountryDto, UpdateCountryStatusDto } from './contracts/country.dto';
import { PaginationQueryDto } from '../../shared/pagination/pagination.dto';
import { CurrentUser, Public, RequirePermissions } from '../../shared/authz/authz.decorators';
import { PERMISSIONS } from '../../shared/permission/permission-keys';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('countries')
@Controller({ path: 'countries', version: '1' })
export class CountriesController {
  constructor(private readonly countries: CountriesService) {}

  // Active countries are needed by public onboarding surfaces (SEO/registration).
  @Public()
  @Get()
  @ApiOperation({ summary: 'List countries (paginated)' })
  async list(@Query() q: PaginationQueryDto) {
    return this.countries.list(q.page, q.pageSize, q.skip);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @RequirePermissions(PERMISSIONS.COUNTRY_MANAGE)
  @ApiOperation({ summary: 'Onboard a new country (configuration activity)' })
  async create(
    @Body() dto: CreateCountryDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.countries.create(dto, actor.accountId, req.correlationId);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @RequirePermissions(PERMISSIONS.COUNTRY_MANAGE)
  @ApiOperation({ summary: 'Change a country status' })
  async setStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCountryStatusDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.countries.setStatus(id, dto.status, actor.accountId, req.correlationId);
  }
}
