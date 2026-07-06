import { ValidationPipe } from '@nestjs/common';

/**
 * Global validation pipe (Blueprint §21; Requirements VR-001).
 * - whitelist + forbidNonWhitelisted: reject unknown fields (deny-by-default input).
 * - transform: coerce payloads to typed DTOs.
 * All inputs are validated before acceptance; invalid input is rejected safely.
 */
export function buildValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    stopAtFirstError: false,
  });
}
