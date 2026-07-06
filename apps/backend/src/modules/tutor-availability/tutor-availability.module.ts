import { Module } from '@nestjs/common';
import { TutorAvailabilityController } from './tutor-availability.controller';
import { TutorAvailabilityService } from './application/tutor-availability.service';

@Module({
  controllers: [TutorAvailabilityController],
  providers: [TutorAvailabilityService],
  exports: [TutorAvailabilityService],
})
export class TutorAvailabilityModule {}
