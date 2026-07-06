import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import type { ApiErrorBody } from '@edu/types';
import { translate } from '@edu/localization';
import { DomainError, DomainErrorCode } from './domain-error';

/**
 * Global exception filter (Blueprint §13). Produces the uniform error envelope,
 * fails closed, and NEVER leaks internal detail, secrets, or minor data
 * (Blueprint §1.5, §13.2). Errors are logged with a correlation id.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  private static readonly domainToHttp: Record<DomainErrorCode, HttpStatus> = {
    [DomainErrorCode.VALIDATION]: HttpStatus.BAD_REQUEST,
    [DomainErrorCode.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
    [DomainErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
    [DomainErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.CONFLICT]: HttpStatus.CONFLICT,
    [DomainErrorCode.RULE_PENDING]: HttpStatus.NOT_IMPLEMENTED,
    [DomainErrorCode.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
  };

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string; language?: string }>();

    const correlationId = request.correlationId ?? randomUUID();
    const language = request.language ?? 'en';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = translate(language, 'error.unexpected');
    let details: unknown;

    if (exception instanceof DomainError) {
      status = GlobalExceptionFilter.domainToHttp[exception.code];
      code = exception.code;
      message = exception.translationKey
        ? translate(language, exception.translationKey)
        : exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      code = HttpStatus[status] ?? 'HTTP_ERROR';
      if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        // class-validator produces { message: string[] } — surface as validation details.
        message = Array.isArray(r.message)
          ? translate(language, 'error.validation')
          : String(r.message ?? message);
        details = Array.isArray(r.message) ? r.message : undefined;
      } else {
        message = String(res);
      }
    }

    // Log server-side with full context; do NOT return internals to the client.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { correlationId, path: request.url, err: exception },
        'Unhandled server error',
      );
    } else {
      this.logger.warn({ correlationId, path: request.url, code }, message);
    }

    const body: ApiErrorBody = {
      error: {
        code,
        message,
        correlationId,
        timestamp: new Date().toISOString(),
        ...(details !== undefined ? { details } : {}),
      },
    };

    response.status(status).json(body);
  }
}
