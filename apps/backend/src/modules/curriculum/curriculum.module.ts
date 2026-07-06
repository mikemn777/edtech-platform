import { Module } from '@nestjs/common';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './application/curriculum.service';

@Module({ controllers: [CurriculumController], providers: [CurriculumService], exports: [CurriculumService] })
export class CurriculumModule {}
