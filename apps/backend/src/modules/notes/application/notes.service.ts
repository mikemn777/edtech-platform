import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { CreateNoteDto, UpdateNoteDto } from '../contracts/note.dto';

/**
 * Notes service (Business Domain Model §12). Self-scoped by construction —
 * every route acts on the caller's own account id, so no cross-account
 * object-level check is needed (mirrors FavoritesService).
 */
@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorAccountId: string, dto: CreateNoteDto) {
    const note = await this.prisma.note.create({
      data: {
        authorAccountId,
        title: dto.title ?? null,
        body: dto.body,
        contextType: dto.contextType ?? null,
        contextId: dto.contextId ?? null,
        createdBy: authorAccountId,
      },
    });
    return this.toView(note);
  }

  async list(authorAccountId: string, contextType?: string, contextId?: string) {
    const rows = await this.prisma.note.findMany({
      where: {
        authorAccountId,
        isDeleted: false,
        ...(contextType ? { contextType } : {}),
        ...(contextId ? { contextId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
    return rows.map((r) => this.toView(r));
  }

  async update(id: string, authorAccountId: string, dto: UpdateNoteDto) {
    const note = await this.getOwned(id, authorAccountId);
    const updated = await this.prisma.note.update({
      where: { id: note.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        updatedBy: authorAccountId,
        recordVersion: { increment: 1 },
      },
    });
    return this.toView(updated);
  }

  async remove(id: string, authorAccountId: string) {
    const note = await this.getOwned(id, authorAccountId);
    await this.prisma.note.update({
      where: { id: note.id },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: authorAccountId },
    });
    return { id: note.id, status: 'removed' };
  }

  private async getOwned(id: string, authorAccountId: string) {
    const note = await this.prisma.note.findFirst({ where: { id, isDeleted: false } });
    if (!note) throw DomainError.notFound('Note not found.');
    if (note.authorAccountId !== authorAccountId) throw DomainError.forbidden('This note belongs to someone else.');
    return note;
  }

  private toView(n: {
    id: string; title: string | null; body: string; contextType: string | null;
    contextId: string | null; createdAt: Date; updatedAt: Date;
  }) {
    return {
      id: n.id,
      title: n.title,
      body: n.body,
      contextType: n.contextType,
      contextId: n.contextId,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    };
  }
}
