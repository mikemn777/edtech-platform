import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurriculumService } from './application/curriculum.service';
import {
  AddPathStepDto, AddProgramCourseDto, CreateCourseDto, CreatePathDto,
  CreateProgramDto, EnrollDto, PublishDto,
} from './contracts/curriculum.dto';
import { CurrentUser, Public } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE3_PERMISSIONS } from '../../shared/permission/permission-keys.phase3';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('curriculum')
@Controller({ path: 'curriculum', version: '1' })
export class CurriculumController {
  constructor(private readonly curriculum: CurriculumService) {}

  @Public() @Get('courses')
  @ApiOperation({ summary: 'List published courses' })
  listCourses(@Query('subject') subject?: string) { return this.curriculum.listPublishedCourses(subject); }

  @Post('courses') @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.COURSE_MANAGE)
  @ApiOperation({ summary: 'Create a course' })
  createCourse(@Body() dto: CreateCourseDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.curriculum.createCourse(dto, a.accountId, r.correlationId);
  }

  @Patch('courses/:id/status') @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.COURSE_MANAGE)
  @ApiOperation({ summary: 'Publish/retire a course' })
  publishCourse(@Param('id') id: string, @Body() dto: PublishDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.curriculum.publishCourse(id, dto.status, a.accountId, r.correlationId);
  }

  @Post('programs') @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.PROGRAM_MANAGE)
  @ApiOperation({ summary: 'Create a program' })
  createProgram(@Body() dto: CreateProgramDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.curriculum.createProgram(dto, a.accountId, r.correlationId);
  }

  @Post('programs/:id/courses') @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.PROGRAM_MANAGE)
  @ApiOperation({ summary: 'Add a course to a program' })
  addProgramCourse(@Param('id') id: string, @Body() dto: AddProgramCourseDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.curriculum.addProgramCourse(id, dto, a.accountId, r.correlationId);
  }

  @Post('paths') @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.PATH_MANAGE)
  @ApiOperation({ summary: 'Create a learning path' })
  createPath(@Body() dto: CreatePathDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.curriculum.createPath(dto, a.accountId, r.correlationId);
  }

  @Post('paths/:id/steps') @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.PATH_MANAGE)
  @ApiOperation({ summary: 'Add a step to a learning path' })
  addPathStep(@Param('id') id: string, @Body() dto: AddPathStepDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.curriculum.addPathStep(id, dto, a.accountId, r.correlationId);
  }

  @Post('enrollments') @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.ENROLLMENT_MANAGE)
  @ApiOperation({ summary: 'Enroll a student in a course/program/path' })
  enroll(@Body() dto: EnrollDto, @CurrentUser() a: AuthenticatedPrincipal, @Req() r: Request & { correlationId?: string }) {
    return this.curriculum.enroll(dto, a.accountId, r.correlationId);
  }

  @Get('students/:studentId/enrollments') @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.COURSE_READ)
  @ApiOperation({ summary: 'List a student’s enrollments' })
  listEnrollments(@Param('studentId') studentId: string) { return this.curriculum.listEnrollments(studentId); }
}
