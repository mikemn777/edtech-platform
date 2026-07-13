import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { StudentService } from './application/student.service';
import { CreateStudentProfileDto, UpdateStudentProfileDto } from './contracts/student.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2_PERMISSIONS } from '../../shared/permission/permission-keys.phase2';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('students')
@ApiBearerAuth('access-token')
@Controller({ path: 'students', version: '1' })
export class StudentController {
  constructor(private readonly students: StudentService) {}

  @Post('profiles')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.STUDENT_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Create a student profile' })
  async create(
    @Body() dto: CreateStudentProfileDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.students.create(dto, actor, req.correlationId);
  }

  @Get('profiles/me')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.STUDENT_PROFILE_READ)
  @ApiOperation({ summary: 'Get the current user’s student profile (null if none)' })
  async mine(@CurrentUser() actor: AuthenticatedPrincipal) {
    try {
      return await this.students.getByAccount(actor.accountId);
    } catch {
      return null;
    }
  }

  @Get('profiles/:id')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.STUDENT_PROFILE_READ)
  @ApiOperation({ summary: 'Get a student profile by id (own profile, an active guardian, or staff)' })
  async get(@Param('id') id: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.students.getById(id, actor);
  }

  @Patch('profiles/:id')
  @RequirePermissionKeys(PHASE2_PERMISSIONS.STUDENT_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Update a student profile (own profile, an active guardian, or staff)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentProfileDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.students.update(id, dto, actor, req.correlationId);
  }
}
