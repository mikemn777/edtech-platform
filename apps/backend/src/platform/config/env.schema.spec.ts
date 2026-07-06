import { validateEnv } from './env.schema';

describe('validateEnv (Blueprint §10.3 — fail-fast config)', () => {
  const base = {
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db?schema=public',
    JWT_ACCESS_SECRET: 'a_sufficiently_long_secret',
    JWT_REFRESH_SECRET: 'another_long_enough_secret',
  };

  it('accepts a valid minimal environment and applies defaults', () => {
    const env = validateEnv({ ...base });
    expect(env.NODE_ENV).toBe('development');
    expect(env.BACKEND_PORT).toBe(4000);
    expect(env.SUPPORTED_LANGUAGES).toContain('ar');
  });

  it('rejects a missing DATABASE_URL (fails closed)', () => {
    const { DATABASE_URL, ...withoutDb } = base;
    void DATABASE_URL;
    expect(() => validateEnv(withoutDb)).toThrow(/environment configuration/i);
  });

  it('rejects too-short JWT secrets', () => {
    expect(() => validateEnv({ ...base, JWT_ACCESS_SECRET: 'short' })).toThrow();
  });

  it('refuses production with default dev secrets (Blueprint §11, §17)', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'dev_only_access_secret_change_me',
        JWT_REFRESH_SECRET: 'dev_only_refresh_secret_change_me',
      }),
    ).toThrow(/default development jwt secrets/i);
  });
});
