import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotesService } from './application/notes.service';
import { CreateNoteDto, UpdateNoteDto } from './contracts/note.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE3_PERMISSIONS } from '../../shared/permission/permission-keys.phase3';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

/** Notes — scoped to the caller's own account (self-scope by construction). */
@ApiTags('notes')
@ApiBearerAuth('access-token')
@Controller({ path: 'notes', version: '1' })
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Post()
  @RequirePermissionKeys(PHASE3_PERMISSIONS.NOTE_MANAGE)
  @ApiOperation({ summary: 'Create a note' })
  create(@Body() dto: CreateNoteDto, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.notes.create(actor.accountId, dto);
  }

  @Get()
  @RequirePermissionKeys(PHASE3_PERMISSIONS.NOTE_MANAGE)
  @ApiOperation({ summary: 'List my notes (optionally filtered by context)' })
  @ApiQuery({ name: 'contextType', required: false })
  @ApiQuery({ name: 'contextId', required: false })
  list(
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Query('contextType') contextType?: string,
    @Query('contextId') contextId?: string,
  ) {
    return this.notes.list(actor.accountId, contextType, contextId);
  }

  @Patch(':id')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.NOTE_MANAGE)
  @ApiOperation({ summary: 'Update one of my notes' })
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.notes.update(id, actor.accountId, dto);
  }

  @Delete(':id')
  @RequirePermissionKeys(PHASE3_PERMISSIONS.NOTE_MANAGE)
  @ApiOperation({ summary: 'Delete one of my notes' })
  remove(@Param('id') id: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.notes.remove(id, actor.accountId);
  }
}
