import { Body, Controller, Delete, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ResourcesService } from './application/resources.service';
import { CreateResourceDto } from './contracts/resource.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE3_PERMISSIONS } from '../../shared/permission/permission-keys.phase3';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

@ApiTags('resources')
@ApiBearerAuth('access-token')
@Controller({ path: 'resources', version: '1' })
export class ResourcesController {
  constructor(private readonly resources: ResourcesService) {}

  @Post()
  @RequirePermissionKeys(PHASE3_PERMISSIONS.RESOURCE_MANAGE)
  @ApiOperation({ summary: 'Upload a resource (base64 content)' })
  upload(
    @Body() dto: CreateResourceDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.resources.upload(dto, actor, req.correlationId);
  }

  @Get('mine')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.RESOURCE_MANAGE)
  @ApiOperation({ summary: 'List resources I uploaded' })
  mine(@CurrentUser() actor: AuthenticatedPrincipal) {
    return this.resources.listMine(actor.accountId);
  }

  @Get(':id')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.RESOURCE_READ)
  @ApiOperation({ summary: 'Get resource metadata (owner, or staff, only)' })
  metadata(@Param('id') id: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.resources.getMetadata(id, actor);
  }

  @Get(':id/content')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.RESOURCE_READ)
  @ApiOperation({ summary: 'Download resource content (owner, or staff, only)' })
  async content(@Param('id') id: string, @CurrentUser() actor: AuthenticatedPrincipal, @Res() res: Response) {
    const { content, contentType, title } = await this.resources.getContent(id, actor);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}"`);
    res.send(content);
  }

  @Delete(':id')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.RESOURCE_MANAGE)
  @ApiOperation({ summary: 'Delete a resource (owner, or staff, only)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.resources.remove(id, actor, req.correlationId);
  }
}
