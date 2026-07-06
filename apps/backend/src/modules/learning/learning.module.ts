import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { LearningService } from './application/learning.service';

@Module({
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
