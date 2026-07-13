import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** Config scope (Master Schema — Setting; Constitution Art. X). Mirrors the
 * Prisma ConfigScope enum; kept separate so this contracts layer doesn't
 * depend on generated Prisma types (Clean Architecture §4). */
export enum ConfigScopeDto {
  PLATFORM = 'PLATFORM',
  COUNTRY = 'COUNTRY',
  JURISDICTION = 'JURISDICTION',
  ROLE = 'ROLE',
  ACCOUNT = 'ACCOUNT',
}

export class UpsertSettingDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  settingKey!: string;

  @ApiProperty({ enum: ConfigScopeDto })
  @IsEnum(ConfigScopeDto)
  scopeType!: ConfigScopeDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  scopeReference?: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  value!: Record<string, unknown>;
}
