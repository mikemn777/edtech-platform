import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AssignmentsService } from './application/assignments.service';
import { CreateAssignmentDto, GradeAssignmentDto, SubmitAssignmentDto } from './contracts/assignment.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

const ASSIGNMENT_MANAGE = 'assignment.assignment.manage'; // tutor: create + grade
const ASSIGNMENT_READ = 'assignment.assignment.read'; // student/tutor: read
const ASSIGNMENT_SUBMIT = 'assignment.submission.manage'; // student: submit

@ApiTags('assignments')
@ApiBearerAuth('access-token')
@Controller({ path: 'assignments', version: '1' })
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @Post()
  @RequirePermissionKeys(ASSIGNMENT_MANAGE)
  @ApiOperation({ summary: 'Assign homework to a student (by their link code)' })
  create(
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.assignments.create(dto, actor.accountId, req.correlationId);
  }

  @Get('authored')
  @RequirePermissionKeys(ASSIGNMENT_MANAGE)
  @ApiOperation({ summary: 'List homework I assigned (tutor)' })
  listAuthored(@CurrentUser() actor: AuthenticatedPrincipal) {
    return this.assignments.listAuthored(actor.accountId);
  }

  @Get('students/:studentId')
  @RequirePermissionKeys(ASSIGNMENT_READ)
  @ApiOperation({ summary: "List a student's homework (own record, an active guardian, or a tutor who has assigned them homework)" })
  listForStudent(@Param('studentId') studentId: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.assignments.listForStudent(studentId, actor);
  }

  @Post(':id/submit')
  @RequirePermissionKeys(ASSIGNMENT_SUBMIT)
  @ApiOperation({ summary: 'Submit my homework (student)' })
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitAssignmentDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.assignments.submit(id, actor.accountId, dto, req.correlationId);
  }

  @Post(':id/grade')
  @RequirePermissionKeys(ASSIGNMENT_MANAGE)
  @ApiOperation({ summary: 'Grade a submission (only the tutor who assigned it): score 0–100 + feedback' })
  grade(
    @Param('id') id: string,
    @Body() dto: GradeAssignmentDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.assignments.grade(id, actor, dto, req.correlationId);
  }
}
