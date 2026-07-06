import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ConfigScope } from '@edu/types';

/** Config scope (Master Schema — Setting; Constitution Art. X). */
export enum ConfigScopeDto {
  PLATFORM = 'PLATFORM',
  COUNTRY = 'COUNTRY',
  JURISDICTION = 'JURISDICTION',
  ROLE = 'ROLE',
  ACCOUNT = 'ACCOUNT',
}
void ConfigScope;

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
