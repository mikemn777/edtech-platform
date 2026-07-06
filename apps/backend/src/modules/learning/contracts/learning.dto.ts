import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export enum GoalStatusDto {
  ACTIVE = 'ACTIVE',
  ACHIEVED = 'ACHIEVED',
  ABANDONED = 'ABANDONED',
}

export class CreateGoalDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsISO8601()
  targetDate?: string;
}

export class UpdateGoalStatusDto {
  @ApiProperty({ enum: GoalStatusDto })
  @IsEnum(GoalStatusDto)
  status!: GoalStatusDto;
}

export class RecordProgressDto {
  @ApiProperty({ example: 'sessions_completed' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  metricKey!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @ApiPropertyOptional({ description: 'Optional linked goal id.' })
  @IsOptional()
  @IsUUID()
  goalId?: string;
}
