import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AppConfigService } from '../../../platform/config/app-config.service';

/**
 * Password hashing behind a port (System Architecture §4.2). Uses Argon2id with
 * configurable cost parameters (Blueprint §11). Plaintext is never stored or
 * logged (DB Arch §21; logging redaction §12.3).
 */
@Injectable()
export class PasswordHasher {
  constructor(private readonly config: AppConfigService) {}

  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost: this.config.get('PASSWORD_HASH_MEMORY_COST'),
      timeCost: this.config.get('PASSWORD_HASH_TIME_COST'),
      parallelism: this.config.get('PASSWORD_HASH_PARALLELISM'),
    });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false; // fail closed on malformed hashes
    }
  }
}
