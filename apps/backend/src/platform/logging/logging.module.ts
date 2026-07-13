import { Module } from '@nestjs/common';
import type { IncomingMessage } from 'http';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/app-config.service';

/** What CorrelationMiddleware actually attaches to the request (runs before
 * pino-http's per-request hooks, so these are always present by then). */
type RequestWithCorrelation = IncomingMessage & { correlationId?: string; language?: string };

/**
 * Structured logging (Blueprint §12). Correlated (correlation id), leveled,
 * centralized-ready, and privacy-preserving: sensitive fields are redacted so
 * no secrets, tokens, or personal/minor data leak into logs (§12.3, Art. VI).
 */
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL'),
          transport: config.get('LOG_PRETTY')
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
          autoLogging: true,
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'req.body.currentPassword',
              'req.body.newPassword',
              'req.body.refreshToken',
              '*.secretReference',
              '*.refreshTokenHash',
              '*.password',
            ],
            censor: '[REDACTED]',
          },
          customProps: (req: RequestWithCorrelation) => ({
            correlationId: req.correlationId,
            language: req.language,
          }),
          // Never log full request bodies at info+ in production.
          serializers: {
            req: (req: RequestWithCorrelation) => ({
              method: req.method,
              url: req.url,
              correlationId: req.correlationId,
            }),
          },
        },
      }),
    }),
  ],
})
export class AppLoggingModule {}
