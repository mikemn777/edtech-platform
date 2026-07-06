import { Module } from '@nestjs/common';
import { TutorDashboardController } from './tutor-dashboard.controller';
import { TutorDashboardService } from './application/tutor-dashboard.service';

@Module({
  controllers: [TutorDashboardController],
  providers: [TutorDashboardService],
  exports: [TutorDashboardService],
})
export class TutorDashboardModule {}
