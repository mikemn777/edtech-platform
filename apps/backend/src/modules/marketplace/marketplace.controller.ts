import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarketplaceService } from './application/marketplace.service';
import { TutorSearchQueryDto } from './contracts/search.dto';
import { Public } from '../../shared/authz/authz.decorators';

/**
 * Marketplace discovery endpoints (Business Domain Model §7). PUBLIC and
 * server-renderable for SEO (Blueprint §19). Verified-only, privacy-safe.
 */
@ApiTags('marketplace')
@Controller({ path: 'marketplace', version: '1' })
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Public()
  @Get('tutors')
  @ApiOperation({ summary: 'Search/discover verified tutors (filters + pagination)' })
  async search(@Query() query: TutorSearchQueryDto) {
    return this.marketplace.search(query);
  }

  @Public()
  @Get('tutors/:id')
  @ApiOperation({ summary: 'Public tutor profile (verified only, privacy-safe)' })
  async publicProfile(@Param('id') id: string) {
    return this.marketplace.publicProfile(id);
  }
}
