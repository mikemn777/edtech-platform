import { z } from 'zod';

/**
 * Environment schema — validated at startup; the process fails fast on invalid
 * or missing configuration (Implementation Blueprint §10.3). Nothing that varies
 * by environment is hardcoded (Constitution Art. X).
 */
const booleanFromString = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true');

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  APP_NAME: z.string().min(1).default('edu-ecosystem-platform'),

  BACKEND_PORT: z.coerce.number().int().positive().default(4000),
  BACKEND_GLOBAL_PREFIX: z.string().default('api'),
  API_DEFAULT_VERSION: z.string().default('1'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().url(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_TLS: booleanFromString.default('false'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_TTL: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL: z.coerce.number().int().positive().default(1209600),
  PASSWORD_HASH_MEMORY_COST: z.coerce.number().int().positive().default(19456),
  PASSWORD_HASH_TIME_COST: z.coerce.number().int().positive().default(2),
  PASSWORD_HASH_PARALLELISM: z.coerce.number().int().positive().default(1),

  DEFAULT_LANGUAGE: z.string().default('en'),
  SUPPORTED_LANGUAGES: z.string().default('en,ar,tr'),
  DEFAULT_LOCALE: z.string().default('en-US'),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_ROOT: z.string().default('./.storage'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: booleanFromString.default('false'),

  HEALTH_DB_TIMEOUT_MS: z.coerce.number().int().positive().default(2000),
});

export type EnvVars = z.infer<typeof envSchema>;

/** Validate raw env; throws with a clear message on failure (fail-fast). */
export function validateEnv(raw: Record<string, unknown>): EnvVars {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  // Production must not run with dev-only secrets (Blueprint §11, §17).
  if (parsed.data.NODE_ENV === 'production') {
    const weak = ['dev_only_access_secret_change_me', 'dev_only_refresh_secret_change_me'];
    if (weak.includes(parsed.data.JWT_ACCESS_SECRET) || weak.includes(parsed.data.JWT_REFRESH_SECRET)) {
      throw new Error('Refusing to start in production with default development JWT secrets.');
    }
  }
  return parsed.data;
}
