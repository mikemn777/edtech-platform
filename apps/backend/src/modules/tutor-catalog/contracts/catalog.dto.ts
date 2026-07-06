import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsPositive, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AddSubjectDto {
  @ApiProperty({ example: 'physics' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  subject!: string;
}

export class AddLanguageDto {
  @ApiProperty({ description: 'Language id (configurable reference).' })
  @IsUUID()
  languageId!: string;

  @ApiProperty({ enum: ['native', 'fluent', 'intermediate', 'basic'], default: 'fluent' })
  @IsIn(['native', 'fluent', 'intermediate', 'basic'])
  proficiency!: 'native' | 'fluent' | 'intermediate' | 'basic';
}

export enum RateUnitDto {
  PER_HOUR = 'PER_HOUR',
  PER_SESSION = 'PER_SESSION',
}

export class SetRateDto {
  // Money is currency-explicit (DB Arch §12). Indicative rate only — commission/
  // settlement rules are Pending Business Decisions (BR-100/101).
  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @IsPositive()
  rate!: number;

  @ApiProperty({ description: 'Currency id (configurable reference).' })
  @IsUUID()
  currencyId!: string;

  @ApiProperty({ enum: RateUnitDto, default: RateUnitDto.PER_HOUR })
  @IsEnum(RateUnitDto)
  unit!: RateUnitDto;
}
