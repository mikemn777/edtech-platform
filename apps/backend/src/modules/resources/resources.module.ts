import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './application/resources.service';

/**
 * Resources / Files module (Business Domain Model §12). FileStorageModule is
 * @Global(), so STORAGE_PORT is available here without an explicit import.
 */
@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
