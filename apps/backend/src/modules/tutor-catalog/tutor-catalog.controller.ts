import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { TutorCatalogService } from './application/tutor-catalog.service';
import { AddLanguageDto, AddSubjectDto, SetRateDto } from './contracts/catalog.dto';
import { CurrentUser, Public } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2B_PERMISSIONS } from '../../shared/permission/permission-keys.phase2b';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('tutor-catalog')
@Controller({ path: 'tutors/:tutorId', version: '1' })
export class TutorCatalogController {
  constructor(private readonly catalog: TutorCatalogService) {}

  @Public()
  @Get('subjects')
  @ApiOperation({ summary: 'List a tutor’s subjects' })
  listSubjects(@Param('tutorId') tutorId: string) {
    return this.catalog.listSubjects(tutorId);
  }

  @Post('subjects')
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.TUTOR_SUBJECT_MANAGE)
  @ApiOperation({ summary: 'Add a subject' })
  addSubject(
    @Param('tutorId') tutorId: string,
    @Body() dto: AddSubjectDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.catalog.addSubject(tutorId, dto, actor, req.correlationId);
  }

  @Delete('subjects/:subjectId')
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.TUTOR_SUBJECT_MANAGE)
  @ApiOperation({ summary: 'Remove a subject (that tutor, or staff, only)' })
  removeSubject(
    @Param('subjectId') subjectId: string,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.catalog.removeSubject(subjectId, actor, req.correlationId);
  }

  @Public()
  @Get('languages')
  @ApiOperation({ summary: 'List a tutor’s languages' })
  listLanguages(@Param('tutorId') tutorId: string) {
    return this.catalog.listLanguages(tutorId);
  }

  @Post('languages')
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.TUTOR_LANGUAGE_MANAGE)
  @ApiOperation({ summary: 'Add a spoken language' })
  addLanguage(
    @Param('tutorId') tutorId: string,
    @Body() dto: AddLanguageDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.catalog.addLanguage(tutorId, dto, actor, req.correlationId);
  }

  @Public()
  @Get('rate')
  @ApiOperation({ summary: 'Get a tutor’s active indicative rate' })
  getRate(@Param('tutorId') tutorId: string) {
    return this.catalog.getActiveRate(tutorId);
  }

  @Put('rate')
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.TUTOR_RATE_MANAGE)
  @ApiOperation({ summary: 'Set the tutor’s indicative rate (currency-explicit)' })
  setRate(
    @Param('tutorId') tutorId: string,
    @Body() dto: SetRateDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.catalog.setRate(tutorId, dto, actor, req.correlationId);
  }
}
