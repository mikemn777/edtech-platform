import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { AppConfigService } from '../config/app-config.service';

/**
 * Health & readiness endpoints (Blueprint §24; System Architecture §22).
 * - /health/live  : process liveness (no dependencies).
 * - /health/ready : readiness — verifies DB and Redis (used by orchestrators).
 * Version-neutral so ops probing stays stable across API versions.
 */
@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  live(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (checks DB + Redis)' })
  async ready(): Promise<{
    status: string;
    checks: Record<string, 'up' | 'down'>;
    timestamp: string;
  }> {
    const timeout = this.config.get('HEALTH_DB_TIMEOUT_MS');
    const checks: Record<string, 'up' | 'down'> = { database: 'down', redis: 'down' };

    try {
      await this.prisma.ping(timeout);
      checks.database = 'up';
    } catch {
      checks.database = 'down';
    }
    try {
      checks.redis = (await this.redis.ping()) ? 'up' : 'down';
    } catch {
      checks.redis = 'down';
    }

    const allUp = Object.values(checks).every((c) => c === 'up');
    return {
      status: allUp ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
