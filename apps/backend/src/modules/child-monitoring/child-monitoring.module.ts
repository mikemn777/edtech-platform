import { Module } from '@nestjs/common';
import { ChildMonitoringController } from './child-monitoring.controller';
import { ChildMonitoringService } from './application/child-monitoring.service';

@Module({
  controllers: [ChildMonitoringController],
  providers: [ChildMonitoringService],
  exports: [ChildMonitoringService],
})
export class ChildMonitoringModule {}
