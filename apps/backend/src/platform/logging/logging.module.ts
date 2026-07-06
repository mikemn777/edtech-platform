import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/app-config.service';

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
          customProps: (req: { correlationId?: string; language?: string }) => ({
            correlationId: req.correlationId,
            language: req.language,
          }),
          // Never log full request bodies at info+ in production.
          serializers: {
            req: (req: { method: string; url: string; correlationId?: string }) => ({
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
