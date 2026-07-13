import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CertificatesService } from './application/certificates.service';
import { IssueCertificateDto } from './contracts/certificate.dto';
import { CurrentUser, Public } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE3_PERMISSIONS } from '../../shared/permission/permission-keys.phase3';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('certificates')
@Controller({ path: 'certificates', version: '1' })
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.CERTIFICATE_ISSUE)
  @ApiOperation({ summary: 'Issue a certificate (the owning tutor, or staff; student must be enrolled)' })
  issue(
    @Body() dto: IssueCertificateDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.certificates.issue(dto, actor, req.correlationId);
  }

  @Get('students/:studentId')
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.CERTIFICATE_READ)
  @ApiOperation({ summary: "List a student's certificates (own profile, an active guardian, or staff)" })
  listForStudent(@Param('studentId') studentId: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.certificates.listForStudent(studentId, actor);
  }

  @Post(':id/revoke')
  @ApiBearerAuth('access-token')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.CERTIFICATE_ISSUE)
  @ApiOperation({ summary: 'Revoke a certificate (the original issuer, or staff)' })
  revoke(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.certificates.revoke(id, actor, req.correlationId);
  }

  @Public()
  @Get('verify/:serialNumber')
  @ApiOperation({ summary: 'Publicly verify a certificate by serial number (no auth required)' })
  verify(@Param('serialNumber') serialNumber: string) {
    return this.certificates.verify(serialNumber);
  }
}
