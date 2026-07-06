import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Booking contracts (Business Domain Model §7). A booking REQUEST captures the
 * intended slot. Commercial rules (final price, payment, cancellation policy) and
 * who-may-book (esp. for minors) are Pending Business Decisions — the workflow is
 * structural and fails closed where a rule is required (BR-100/102/003).
 */
export class CreateBookingDto {
  @ApiProperty({ description: 'Student profile id (the learner).' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Tutor profile id (must be verified).' })
  @IsUUID()
  tutorId!: string;

  @ApiPropertyOptional({ description: 'Offering id (optional).' })
  @IsOptional()
  @IsUUID()
  offeringId?: string;

  @ApiPropertyOptional({ description: 'Availability window id the slot falls within.' })
  @IsOptional()
  @IsUUID()
  availabilityId?: string;

  @ApiProperty({ description: 'Slot start (ISO 8601, absolute).', example: '2026-08-01T10:00:00Z' })
  @IsISO8601()
  scheduledStart!: string;

  @ApiProperty({ description: 'Slot end (ISO 8601, absolute).', example: '2026-08-01T11:00:00Z' })
  @IsISO8601()
  scheduledEnd!: string;
}

export class CancelBookingDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
