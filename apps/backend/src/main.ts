import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AppConfigService } from './platform/config/app-config.service';
import { GlobalExceptionFilter } from './platform/errors/global-exception.filter';
import { buildValidationPipe } from './platform/validation/validation.pipe';
import { setupSwagger } from './platform/swagger/swagger.setup';

/**
 * Application bootstrap. Wires the cross-cutting platform concerns required by
 * the Implementation Blueprint before any request is served:
 *   - Structured logging (§20)         - Global validation (§21)
 *   - Global error envelope (§13, §19) - API versioning (§22, System Arch §29)
 *   - Security headers + CORS (§17,§29)- OpenAPI docs (§23)
 *   - Graceful shutdown (§22 ops)      - Production-safe config (§30)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use pino logger for framework logs too (correlated, redacted — §12).
  app.useLogger(app.get(Logger));

  const config = app.get(AppConfigService);

  // Security headers (Blueprint §17). CSP tuned per surface later.
  app.use(helmet({ contentSecurityPolicy: config.isProduction ? undefined : false }));

  // CORS — explicit origins; never wildcard in production (Blueprint §17).
  app.enableCors({
    origin: config.corsOrigins.length ? config.corsOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-language', 'x-correlation-id'],
  });

  // Global API prefix + URI versioning (Blueprint §22; System Architecture §29).
  app.setGlobalPrefix(config.get('BACKEND_GLOBAL_PREFIX'));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.get('API_DEFAULT_VERSION'),
    prefix: 'v',
  });

  // Uniform validation and error handling (Blueprint §13, §21).
  app.useGlobalPipes(buildValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Graceful shutdown for safe rollout/rollback (System Architecture §12-13).
  app.enableShutdownHooks();

  setupSwagger(app, config);

  const port = config.get('BACKEND_PORT');
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(
    `Backend listening on :${port}/${config.get('BACKEND_GLOBAL_PREFIX')} ` +
      `(env=${config.get('NODE_ENV')}, default API v${config.get('API_DEFAULT_VERSION')})`,
  );
}

void bootstrap();
