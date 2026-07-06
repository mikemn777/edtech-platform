import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { TutorService } from './application/tutor.service';

@Module({
  controllers: [TutorController],
  providers: [TutorService],
  exports: [TutorService],
})
export class TutorModule {}
