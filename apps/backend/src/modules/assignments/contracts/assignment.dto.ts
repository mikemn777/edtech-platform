import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

/**
 * Homework / Assignments contracts. Learner data is classified minor_related
 * and audited (Constitution Art. VI). Grading model (v1): score 0–100 + a
 * short written feedback note.
 */
export class CreateAssignmentDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ maxLength: 4000 })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @ApiProperty({ description: "The student's account id (their link code)." })
  @IsUUID()
  studentAccountId!: string;

  @ApiPropertyOptional({ description: 'Optional linked course id.' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  dueAt?: string;
}

export class SubmitAssignmentDto {
  @ApiProperty({ maxLength: 4000, description: 'The student\'s answer text or a link to their work.' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  contentReference!: string;
}

export class GradeAssignmentDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional({ maxLength: 4000 })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  feedback?: string;
}
