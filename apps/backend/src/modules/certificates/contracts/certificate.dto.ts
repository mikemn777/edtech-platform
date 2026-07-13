import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

const ISSUABLE_TYPES = ['COURSE', 'PROGRAM', 'PATH'] as const;
export type IssuableTypeDto = (typeof ISSUABLE_TYPES)[number];

/**
 * Certificates contracts (Business Domain Model §12). Issuance is a manual
 * action by the owning tutor (or staff) once the student has a real
 * enrollment in the target — "automatic issuance on completion" would need
 * an authoritative definition of "completion" per market, which is not
 * established (Constitution Art. IX), so it isn't invented here.
 */
export class IssueCertificateDto {
  @ApiProperty({ description: 'StudentProfile id.' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ enum: ISSUABLE_TYPES })
  @IsIn(ISSUABLE_TYPES)
  issuedForType!: IssuableTypeDto;

  @ApiProperty({ description: 'Id of the course/program/path the student completed.' })
  @IsUUID()
  issuedForId!: string;
}
