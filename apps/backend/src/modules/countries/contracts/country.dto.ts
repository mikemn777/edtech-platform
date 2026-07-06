import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';

/** Country lifecycle status (Master Schema — Country). */
export enum CountryStatusDto {
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateCountryDto {
  @ApiProperty({ example: 'TR', description: 'ISO country code (configurable data — Art. IX/X)' })
  @IsString()
  @Length(2, 3)
  countryCode!: string;

  @ApiProperty({ example: 'Türkiye' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: CountryStatusDto, required: false, default: CountryStatusDto.ONBOARDING })
  @IsOptional()
  @IsEnum(CountryStatusDto)
  status?: CountryStatusDto;
}

export class UpdateCountryStatusDto {
  @ApiProperty({ enum: CountryStatusDto })
  @IsEnum(CountryStatusDto)
  status!: CountryStatusDto;
}
