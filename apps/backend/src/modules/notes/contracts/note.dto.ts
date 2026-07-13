import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * Notes contracts (Business Domain Model §12; PHASE3_PROGRESS.md — self-scoped
 * CRUD). A note is always the author's own personal record; classification
 * "personal" per schema default.
 */
export class CreateNoteDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ maxLength: 8000 })
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  body!: string;

  @ApiPropertyOptional({ description: 'What this note is attached to, e.g. "course", "session", "assignment".' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contextType?: string;

  @ApiPropertyOptional({ description: 'Id of the contextType record this note is attached to.' })
  @IsOptional()
  @IsUUID()
  contextId?: string;
}

export class UpdateNoteDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ maxLength: 8000 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  body?: string;
}
