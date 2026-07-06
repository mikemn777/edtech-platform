import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsObject, IsOptional, IsUUID } from 'class-validator';

/**
 * Student profile contracts (Business Domain Model §3). A student profile is the
 * learner specialization of an account. date_of_birth drives minor determination,
 * whose authoritative rule is a Pending Business/Legal Decision (Art. VI) — until
 * set, a student is treated as a minor (most protective, BR-003).
 */
export class CreateStudentProfileDto {
  @ApiPropertyOptional({ description: 'Owning account id (defaults to caller).' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ format: 'date', example: '2010-05-01' })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Serving jurisdiction (configurable).' })
  @IsOptional()
  @IsUUID()
  jurisdictionId?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  learningContext?: Record<string, unknown>;
}

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jurisdictionId?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  learningContext?: Record<string, unknown>;
}

export class StudentProfileResponse {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() isMinor!: boolean;
  @ApiPropertyOptional() jurisdictionId?: string | null;
}
