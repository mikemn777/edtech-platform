import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './application/student.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
