import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Offering status (Master Schema — TutorOffering). */
export enum OfferingStatusDto {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateTutorProfileDto {
  @ApiPropertyOptional({ description: 'Owning account id (defaults to caller).' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  headline?: string;

  @ApiPropertyOptional({ maxLength: 4000 })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Serving jurisdiction (configurable).' })
  @IsOptional()
  @IsUUID()
  jurisdictionId?: string;
}

export class UpdateTutorProfileDto {
  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  headline?: string;

  @ApiPropertyOptional({ maxLength: 4000 })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jurisdictionId?: string;
}

export class CreateOfferingDto {
  @ApiProperty({ example: 'mathematics' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  subject!: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ maxLength: 4000 })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  // Money is ALWAYS currency-explicit (DB Arch §12). A tutor may state a rate,
  // but commission/fee/pricing RULES are Pending Business Decisions (BR-100/101).
  @ApiPropertyOptional({ description: 'Indicative base price (requires currencyId).' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  basePrice?: number;

  @ApiPropertyOptional({ description: 'Currency id (configurable reference).' })
  @IsOptional()
  @IsUUID()
  currencyId?: string;
}

export class UpdateOfferingStatusDto {
  @ApiProperty({ enum: OfferingStatusDto })
  @IsEnum(OfferingStatusDto)
  status!: OfferingStatusDto;
}
