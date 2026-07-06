import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

/**
 * Assigns a correlation id and resolves the request language for every request.
 * Correlation ties logs, errors, and audit together (Blueprint §12.2, §20).
 * Language drives i18n of responses (Constitution Art. III).
 */
@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  private static readonly SUPPORTED = new Set(['en', 'ar', 'tr']);

  use(
    req: Request & { correlationId?: string; language?: string },
    res: Response,
    next: NextFunction,
  ): void {
    const incoming = req.header('x-correlation-id');
    const correlationId = incoming && incoming.length <= 128 ? incoming : randomUUID();
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    // Resolve language from Accept-Language / custom header, fallback to default.
    const requested = (req.header('x-language') ?? req.acceptsLanguages()[0] ?? 'en')
      .slice(0, 2)
      .toLowerCase();
    req.language = CorrelationMiddleware.SUPPORTED.has(requested) ? requested : 'en';
    res.setHeader('content-language', req.language);

    next();
  }
}
