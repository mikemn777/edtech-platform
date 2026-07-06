import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class AssistDto {
  @ApiProperty({ maxLength: 1000 })
  @IsString() @MinLength(1) @MaxLength(1000)
  prompt!: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() contextReference?: string;
}

export class RecommendQueryDto {
  @ApiPropertyOptional({ description: 'Subject to focus recommendations on.' })
  @IsOptional() @IsString() @MaxLength(120)
  subject?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 20, default: 5 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(20)
  limit = 5;
}
