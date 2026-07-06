import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ description: 'Tutor profile id to favorite (must be verified).' })
  @IsUUID()
  tutorId!: string;
}
