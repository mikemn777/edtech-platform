import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AIService } from './application/ai.service';
import { AssistDto, RecommendQueryDto } from './contracts/ai.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE3_PERMISSIONS } from '../../shared/permission/permission-keys.phase3';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller({ path: 'ai', version: '1' })
export class AIController {
  constructor(private readonly ai: AIService) {}

  @Post('assistant')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.AI_ASSISTANT_USE)
  @ApiOperation({ summary: 'Ask the AI learning assistant (provider-independent)' })
  assist(@Body() dto: AssistDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.ai.assist(a.accountId, dto, r.correlationId);
  }

  @Get('recommendations')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.AI_RECOMMENDATION_USE)
  @ApiOperation({ summary: 'Get AI learning recommendations (provider-independent)' })
  recommend(@Query() dto: RecommendQueryDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.ai.recommend(a.accountId, dto, r.correlationId);
  }
}
