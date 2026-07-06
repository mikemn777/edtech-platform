/**
 * Domain error taxonomy (Implementation Blueprint §13). Domain/application layers
 * throw these technology-neutral errors; the HTTP layer maps them to the uniform
 * error envelope (Blueprint §1.5). This keeps the domain free of HTTP concerns
 * (Clean Architecture — System Architecture §4).
 */
export enum DomainErrorCode {
  VALIDATION = 'VALIDATION_ERROR',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RULE_PENDING = 'RULE_PENDING_BUSINESS_DECISION',
  INTERNAL = 'INTERNAL_ERROR',
}

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly translationKey?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'DomainError';
  }

  static validation(message: string, details?: unknown): DomainError {
    return new DomainError(DomainErrorCode.VALIDATION, message, 'error.validation', details);
  }
  static unauthenticated(message = 'Authentication required'): DomainError {
    return new DomainError(DomainErrorCode.UNAUTHENTICATED, message, 'error.unauthorized');
  }
  static forbidden(message = 'Forbidden'): DomainError {
    return new DomainError(DomainErrorCode.FORBIDDEN, message, 'error.forbidden');
  }
  static notFound(message = 'Not found'): DomainError {
    return new DomainError(DomainErrorCode.NOT_FOUND, message, 'error.not_found');
  }
  static conflict(message: string): DomainError {
    return new DomainError(DomainErrorCode.CONFLICT, message);
  }
  /**
   * Raised when behavior depends on a rule not yet authoritatively established
   * (Constitution Art. IX; Requirements BR-003). Fails closed — never guesses.
   */
  static rulePending(message: string): DomainError {
    return new DomainError(DomainErrorCode.RULE_PENDING, message);
  }
}
