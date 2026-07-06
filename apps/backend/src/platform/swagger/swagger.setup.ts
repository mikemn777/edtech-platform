import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { AppConfigService } from '../config/app-config.service';

/**
 * OpenAPI/Swagger documentation (Blueprint §1.7, §23). Every contract is
 * documented. Disabled in production unless explicitly enabled (surface control).
 */
export function setupSwagger(app: INestApplication, config: AppConfigService): void {
  if (config.isProduction) return; // gate docs off in prod by default

  const doc = new DocumentBuilder()
    .setTitle('Education Ecosystem Platform API')
    .setDescription(
      'Production-grade, multi-country, multi-language education platform. ' +
        'Governed by the Project Constitution v1.0. API-first (Constitution Art. 5.7).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addGlobalParameters({
      name: 'x-language',
      in: 'header',
      required: false,
      description: 'Preferred language (en, ar, tr). Defaults to Accept-Language.',
      schema: { type: 'string', enum: ['en', 'ar', 'tr'] },
    })
    .build();

  const document = SwaggerModule.createDocument(app, doc);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
