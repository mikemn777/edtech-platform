import { Global, Module } from '@nestjs/common';
import { LocalizationController } from './localization.controller';
import { LocalizationService } from './application/localization.service';

/** Global so any module can resolve translations (Constitution Art. III). */
@Global()
@Module({
  controllers: [LocalizationController],
  providers: [LocalizationService],
  exports: [LocalizationService],
})
export class LocalizationModule {}
