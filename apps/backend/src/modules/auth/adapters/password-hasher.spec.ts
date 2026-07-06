import { PasswordHasher } from './password-hasher';
import type { AppConfigService } from '../../../platform/config/app-config.service';

describe('PasswordHasher (Blueprint §11 — Argon2id, never plaintext)', () => {
  const config = {
    get: (key: string) =>
      ({
        PASSWORD_HASH_MEMORY_COST: 19456,
        PASSWORD_HASH_TIME_COST: 2,
        PASSWORD_HASH_PARALLELISM: 1,
      })[key],
  } as unknown as AppConfigService;

  const hasher = new PasswordHasher(config);

  it('produces a hash that is not the plaintext', async () => {
    const hash = await hasher.hash('correct horse battery staple');
    expect(hash).not.toContain('correct horse battery staple');
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('verifies a correct password', async () => {
    const hash = await hasher.hash('s3cret-passphrase');
    expect(await hasher.verify(hash, 's3cret-passphrase')).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hasher.hash('s3cret-passphrase');
    expect(await hasher.verify(hash, 'wrong')).toBe(false);
  });

  it('fails closed on a malformed hash', async () => {
    expect(await hasher.verify('not-a-hash', 'anything')).toBe(false);
  });
});
