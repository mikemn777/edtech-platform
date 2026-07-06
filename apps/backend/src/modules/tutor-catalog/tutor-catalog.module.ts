import { Module } from '@nestjs/common';
import { TutorCatalogController } from './tutor-catalog.controller';
import { TutorCatalogService } from './application/tutor-catalog.service';

@Module({
  controllers: [TutorCatalogController],
  providers: [TutorCatalogService],
  exports: [TutorCatalogService],
})
export class TutorCatalogModule {}
