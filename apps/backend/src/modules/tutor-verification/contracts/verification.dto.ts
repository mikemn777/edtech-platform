import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/** Verification case decision (Business Domain Model §6). */
export enum VerificationDecisionDto {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class OpenVerificationCaseDto {
  @ApiPropertyOptional({ description: 'Serving jurisdiction (configurable).' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  jurisdictionId?: string;
}

export class DecideVerificationDto {
  @ApiProperty({ enum: VerificationDecisionDto })
  @IsEnum(VerificationDecisionDto)
  decision!: VerificationDecisionDto;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
