import { Global, Module } from '@nestjs/common';
import { STORAGE_PORT } from './domain/storage.port';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { AppConfigService } from '../../platform/config/app-config.service';

/**
 * File storage module (module 18). Binds the STORAGE_PORT to a concrete adapter
 * chosen by configuration (STORAGE_DRIVER). Currently: local. S3/other adapters
 * plug in here without touching consumers (Constitution Art. VIII; §4.2).
 */
@Global()
@Module({
  providers: [
    LocalStorageAdapter,
    {
      provide: STORAGE_PORT,
      useFactory: (config: AppConfigService, local: LocalStorageAdapter) => {
        switch (config.get('STORAGE_DRIVER')) {
          case 'local':
            return local;
          // case 's3': return s3Adapter;  // Pending Technical Decision (adapter)
          default:
            return local;
        }
      },
      inject: [AppConfigService, LocalStorageAdapter],
    },
  ],
  exports: [STORAGE_PORT],
})
export class FileStorageModule {}
