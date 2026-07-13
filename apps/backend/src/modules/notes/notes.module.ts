import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './application/notes.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
