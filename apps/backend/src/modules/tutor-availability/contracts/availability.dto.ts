import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsObject, IsOptional } from 'class-validator';

/**
 * Tutor availability contracts (Business Domain Model §5, §8). Availability
 * intent is stored in absolute time (UTC) and presented in the actor's timezone
 * (DB Arch §13). Scheduling CONSTRAINT rules (notice, buffers) are PBD.
 */
export class CreateAvailabilityDto {
  @ApiProperty({ description: 'Start (ISO 8601, absolute time).', example: '2026-08-01T09:00:00Z' })
  @IsISO8601()
  startAt!: string;

  @ApiProperty({ description: 'End (ISO 8601, absolute time).', example: '2026-08-01T11:00:00Z' })
  @IsISO8601()
  endAt!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'Recurrence rule (optional).' })
  @IsOptional()
  @IsObject()
  recurrence?: Record<string, unknown>;
}
