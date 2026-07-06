import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvVars } from './env.schema';

/**
 * Typed, centralized access to validated configuration.
 * Modules depend on this rather than reading process.env directly (Blueprint §10).
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvVars, true>) {}

  get<K extends keyof EnvVars>(key: K): EnvVars[K] {
    return this.config.get(key, { infer: true });
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  get corsOrigins(): string[] {
    return this.get('CORS_ORIGINS')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }

  get supportedLanguages(): string[] {
    return this.get('SUPPORTED_LANGUAGES')
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
  }
}
