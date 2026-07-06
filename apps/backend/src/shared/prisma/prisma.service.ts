import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma lifecycle service (module 5). The database is infrastructure behind a
 * boundary — domain logic never depends on it directly (System Architecture §4;
 * Database Master Architecture §1.1).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to PostgreSQL.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected.');
  }

  /** Used by the readiness health check (module 24). */
  async ping(timeoutMs: number): Promise<boolean> {
    const query = this.$queryRaw`SELECT 1`;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DB ping timeout')), timeoutMs),
    );
    await Promise.race([query, timeout]);
    return true;
  }
}
