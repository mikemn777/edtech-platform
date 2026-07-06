import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';

export enum CourseStatusDto { DRAFT = 'DRAFT', PUBLISHED = 'PUBLISHED', RETIRED = 'RETIRED' }
export enum EnrollableTypeDto { COURSE = 'COURSE', PROGRAM = 'PROGRAM', PATH = 'PATH' }

export class CreateCourseDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @ApiProperty({ example: 'mathematics' }) @IsString() @MaxLength(120) subject!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() jurisdictionId?: string;
}

export class CreateProgramDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() educationalSystemId?: string;
}

export class AddProgramCourseDto {
  @ApiProperty() @IsUUID() courseId!: string;
  @ApiProperty({ minimum: 1 }) @IsInt() @Min(1) sequenceOrder!: number;
}

export class CreatePathDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) description?: string;
}

export class AddPathStepDto {
  @ApiProperty({ example: 'course' }) @IsString() @MaxLength(40) refType!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() refId?: string;
  @ApiProperty() @IsString() @MaxLength(200) title!: string;
  @ApiProperty({ minimum: 1 }) @IsInt() @Min(1) sequenceOrder!: number;
}

export class PublishDto {
  @ApiProperty({ enum: CourseStatusDto }) @IsEnum(CourseStatusDto) status!: CourseStatusDto;
}

export class EnrollDto {
  @ApiProperty() @IsUUID() studentId!: string;
  @ApiProperty({ enum: EnrollableTypeDto }) @IsEnum(EnrollableTypeDto) enrollableType!: EnrollableTypeDto;
  @ApiProperty() @IsUUID() enrollableId!: string;
}
