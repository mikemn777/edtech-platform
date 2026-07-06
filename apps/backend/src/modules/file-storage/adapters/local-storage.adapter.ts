import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { dirname, join, normalize, resolve } from 'path';
import { AppConfigService } from '../../../platform/config/app-config.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type {
  PutObjectInput,
  StoragePort,
  StoredObjectRef,
} from '../domain/storage.port';

/**
 * Local filesystem storage adapter (module 18). Default driver for dev/CI. A
 * production S3/object-store adapter implements the same port without any change
 * to consumers (Clean Architecture §4.2). Path traversal is prevented.
 */
@Injectable()
export class LocalStorageAdapter implements StoragePort {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly root: string;

  constructor(config: AppConfigService) {
    this.root = resolve(config.get('STORAGE_LOCAL_ROOT'));
  }

  private safePath(reference: string): string {
    const full = normalize(join(this.root, reference));
    if (!full.startsWith(this.root)) {
      throw DomainError.forbidden('Invalid storage path.');
    }
    return full;
  }

  async put(input: PutObjectInput): Promise<StoredObjectRef> {
    const path = this.safePath(input.key);
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, input.content);
    this.logger.debug({ key: input.key, size: input.content.length }, 'Object stored (local)');
    return {
      storageReference: input.key,
      contentType: input.contentType,
      sizeBytes: input.content.length,
    };
  }

  async get(storageReference: string): Promise<Buffer> {
    try {
      return await fs.readFile(this.safePath(storageReference));
    } catch {
      throw DomainError.notFound('Object not found.');
    }
  }

  async remove(storageReference: string): Promise<void> {
    try {
      await fs.unlink(this.safePath(storageReference));
    } catch {
      /* idempotent */
    }
  }

  async exists(storageReference: string): Promise<boolean> {
    try {
      await fs.access(this.safePath(storageReference));
      return true;
    } catch {
      return false;
    }
  }
}
