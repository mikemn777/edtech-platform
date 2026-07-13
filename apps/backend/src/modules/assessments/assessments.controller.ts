import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AssessmentsService } from './application/assessments.service';
import { AddQuestionDto, CreateAssessmentDto, SubmitAssessmentDto } from './contracts/assessment.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

const MANAGE = 'assessment.assessment.manage'; // tutor build + results
const READ = 'assessment.assessment.read'; // list + take
const SUBMIT = 'assessment.submission.manage'; // student submit

@ApiTags('assessments')
@ApiBearerAuth('access-token')
@Controller({ path: 'assessments', version: '1' })
export class AssessmentsController {
  constructor(private readonly svc: AssessmentsService) {}

  @Post()
  @RequirePermissionKeys(MANAGE)
  @ApiOperation({ summary: 'Create a quiz (tutor)' })
  create(@Body() dto: CreateAssessmentDto, @CurrentUser() actor: AuthenticatedPrincipal, @Req() req: Request & { correlationId?: string }) {
    return this.svc.create(dto, actor.accountId, req.correlationId);
  }

  @Post(':id/questions')
  @RequirePermissionKeys(MANAGE)
  @ApiOperation({ summary: 'Add a multiple-choice question to a quiz (tutor)' })
  addQuestion(@Param('id') id: string, @Body() dto: AddQuestionDto, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.svc.addQuestion(id, dto, actor.accountId);
  }

  @Get('authored')
  @RequirePermissionKeys(MANAGE)
  @ApiOperation({ summary: 'List quizzes I created (tutor)' })
  authored(@CurrentUser() actor: AuthenticatedPrincipal) {
    return this.svc.listAuthored(actor.accountId);
  }

  @Get(':id/results')
  @RequirePermissionKeys(MANAGE)
  @ApiOperation({ summary: 'See who took a quiz and their scores (tutor)' })
  results(@Param('id') id: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.svc.results(id, actor.accountId);
  }

  @Get('published')
  @RequirePermissionKeys(READ)
  @ApiOperation({ summary: 'List available quizzes (student)' })
  published() {
    return this.svc.listPublished();
  }

  @Get('mine')
  @RequirePermissionKeys(READ)
  @ApiOperation({ summary: 'My quiz results (student)' })
  mine(@CurrentUser() actor: AuthenticatedPrincipal) {
    return this.svc.mySubmissions(actor.accountId);
  }

  @Get(':id/take')
  @RequirePermissionKeys(READ)
  @ApiOperation({ summary: 'Fetch a quiz to take (no answer keys)' })
  take(@Param('id') id: string) {
    return this.svc.getForTaking(id);
  }

  @Post(':id/submit')
  @RequirePermissionKeys(SUBMIT)
  @ApiOperation({ summary: 'Submit quiz answers; auto-graded (student)' })
  submit(@Param('id') id: string, @Body() dto: SubmitAssessmentDto, @CurrentUser() actor: AuthenticatedPrincipal, @Req() req: Request & { correlationId?: string }) {
    return this.svc.submit(id, actor.accountId, dto, req.correlationId);
  }
}
