import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../../platform/config/app-config.service';

/**
 * Redis client (module 6). Used for caching and, later, queues/session support
 * (System Architecture §14-15). Cache is never a source of truth (§14.2).
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor(config: AppConfigService) {
    this.client = new Redis({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD') || undefined,
      tls: config.get('REDIS_TLS') ? {} : undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    this.logger.log('Redis connected.');
  }

  async onModuleDestroy(): Promise<void> {
    this.client.disconnect();
  }

  async ping(): Promise<boolean> {
    const res = await this.client.ping();
    return res === 'PONG';
  }
}
