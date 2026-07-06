import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { DomainError } from '../../../platform/errors/domain-error';

/**
 * Favorites service (Marketplace §7). A student marks verified tutors as
 * favorites. Only VERIFIED tutors can be favorited (consistent with discovery
 * eligibility, BR-002). Scoped to the caller's own account.
 */
@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(studentAccountId: string, tutorId: string) {
    const tutor = await this.prisma.tutorProfile.findFirst({
      where: { id: tutorId, isDeleted: false, verificationStatus: 'VERIFIED' },
    });
    if (!tutor) throw DomainError.notFound('Tutor not found.');

    const existing = await this.prisma.favorite.findUnique({
      where: { studentAccountId_tutorId: { studentAccountId, tutorId } },
    });
    if (existing && !existing.isDeleted) {
      return { id: existing.id, tutorId, status: 'exists' };
    }
    const fav = existing
      ? await this.prisma.favorite.update({
          where: { id: existing.id },
          data: { isDeleted: false, updatedBy: studentAccountId },
        })
      : await this.prisma.favorite.create({
          data: { studentAccountId, tutorId, createdBy: studentAccountId },
        });
    return { id: fav.id, tutorId, status: 'added' };
  }

  async remove(studentAccountId: string, tutorId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { studentAccountId_tutorId: { studentAccountId, tutorId } },
    });
    if (existing && !existing.isDeleted) {
      await this.prisma.favorite.update({
        where: { id: existing.id },
        data: { isDeleted: true, deletedAt: new Date(), deletedBy: studentAccountId },
      });
    }
    return { tutorId, status: 'removed' };
  }

  async list(studentAccountId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { studentAccountId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({ id: r.id, tutorId: r.tutorId, createdAt: r.createdAt }));
  }
}
