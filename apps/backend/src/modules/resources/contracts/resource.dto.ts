import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * Resources / Files contracts (Business Domain Model §12; wraps the
 * provider-independent FileStorage port — Constitution Art. VII). Content is
 * accepted as base64 in the request body (no multipart middleware is wired
 * yet); a future real upload flow can swap the transport without touching the
 * storage port or access-control logic.
 */
export class CreateResourceDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ maxLength: 4000 })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @ApiProperty({ description: 'Base64-encoded file content (10MB decoded limit).' })
  @IsString()
  @MinLength(1)
  @MaxLength(14_000_000)
  contentBase64!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  contentType!: string;

  @ApiPropertyOptional({ description: 'Optional linked course id.' })
  @IsOptional()
  @IsUUID()
  courseId?: string;
}
