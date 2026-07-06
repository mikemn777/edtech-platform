import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class CreateLiveSessionDto {
  @ApiProperty() @IsUUID() tutorId!: string;
  @ApiProperty() @IsUUID() studentId!: string;
  @ApiPropertyOptional({ description: 'Originating booking id.' }) @IsOptional() @IsUUID() bookingId?: string;
  @ApiProperty({ example: '2026-08-01T10:00:00Z' }) @IsISO8601() scheduledStart!: string;
  @ApiProperty({ example: '2026-08-01T11:00:00Z' }) @IsISO8601() scheduledEnd!: string;
}
