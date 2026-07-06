import { Module } from '@nestjs/common';
import { TutorVerificationController } from './tutor-verification.controller';
import { TutorVerificationService } from './application/tutor-verification.service';

@Module({
  controllers: [TutorVerificationController],
  providers: [TutorVerificationService],
  exports: [TutorVerificationService],
})
export class TutorVerificationModule {}
