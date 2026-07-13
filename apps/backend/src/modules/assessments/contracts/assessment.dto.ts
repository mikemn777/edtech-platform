import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

/**
 * Quizzes / Assessments contracts. Payloads are intentionally flat (arrays of
 * primitives, not nested objects) to remain fully compatible with the global
 * whitelist validation pipe without extra transformer dependencies.
 * Answer keys are evaluated server-side and never returned to students.
 */
export class CreateAssessmentDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ description: 'Optional linked course id.' })
  @IsOptional()
  @IsUUID()
  courseId?: string;
}

export class AddQuestionDto {
  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  prompt!: string;

  @ApiProperty({ type: [String], description: '2–6 answer choices.' })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  options!: string[];

  @ApiProperty({ minimum: 0, maximum: 5, description: 'Index of the correct choice (0-based).' })
  @IsInt()
  @Min(0)
  @Max(5)
  correctIndex!: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  points?: number;
}

export class SubmitAssessmentDto {
  @ApiProperty({ type: [String], description: 'Question ids being answered.' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  questionIds!: string[];

  @ApiProperty({ type: [Number], description: 'Chosen option index for each question (same order).' })
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  selectedIndexes!: number[];
}
