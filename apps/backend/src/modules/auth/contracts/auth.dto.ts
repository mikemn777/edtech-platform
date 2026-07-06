import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Registration input. Validated & whitelisted (Blueprint §21; Requirements VR-001). */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ minLength: 12, example: 'a-strong-passphrase' })
  @IsString()
  @MinLength(12)
  @MaxLength(256)
  password!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  displayName!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  refreshToken!: string;
}

export class AuthTokensResponse {
  @ApiProperty() accessToken!: string;
  @ApiProperty() refreshToken!: string;
  @ApiProperty() accessExpiresIn!: number;
  @ApiProperty() refreshExpiresIn!: number;
}
