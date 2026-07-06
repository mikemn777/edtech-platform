import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

/**
 * Tutor discovery filters (Business Domain Model §7; Marketplace foundation).
 * All filters are optional and validated. Discovery returns ONLY verified,
 * discoverable tutors (BR-002) and exposes no sensitive/minor data (Art. VI).
 */
export class TutorSearchQueryDto {
  @ApiPropertyOptional({ description: 'Free-text query over subject/title/headline.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by subject (configurable taxonomy).' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  subject?: string;

  @ApiPropertyOptional({ description: 'Filter by serving jurisdiction id.' })
  @IsOptional()
  @IsUUID()
  jurisdictionId?: string;

  @ApiPropertyOptional({ description: 'Filter offerings priced in this currency id.' })
  @IsOptional()
  @IsUUID()
  currencyId?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Minimum indicative price.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Maximum indicative price.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ['rating', 'newest'], default: 'rating' })
  @IsOptional()
  @IsIn(['rating', 'newest'])
  sort?: 'rating' | 'newest';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize = 20;

  get skip(): number {
    return (this.page - 1) * this.pageSize;
  }
}
