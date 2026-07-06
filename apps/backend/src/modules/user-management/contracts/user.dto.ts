import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { SystemRole } from '@edu/types';

export class AssignRoleDto {
  @ApiProperty({ enum: SystemRole })
  @IsEnum(SystemRole)
  role!: SystemRole;
}

export class UpdateAccountDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  primaryLocaleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  primaryJurisdictionId?: string;
}
