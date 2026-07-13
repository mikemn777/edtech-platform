import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './application/assignments.service';

@Module({
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
