import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsUUID } from 'class-validator';

/**
 * Parent profile contracts (Business Domain Model §4). The parent/guardian
 * specialization of an account. Oversight scope over a linked student is a
 * Pending Business/Legal Decision (Roles §8; BR-102) — this profile carries only
 * structure, not oversight rules.
 */
export class CreateParentProfileDto {
  @ApiPropertyOptional({ description: 'Owning account id (defaults to caller).' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  oversightContext?: Record<string, unknown>;
}

export class UpdateParentProfileDto {
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  oversightContext?: Record<string, unknown>;
}

export class ParentProfileResponse {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
}
