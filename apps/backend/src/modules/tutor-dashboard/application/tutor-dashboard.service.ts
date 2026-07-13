import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';

/**
 * Tutor Dashboard service (Business Domain Model §5). Read-only aggregation of a
 * tutor's operational state: verification, offerings, subjects, availability, and
 * booking counts by status. No business rules; purely a summarized view (Reports
 * domain flavor) constrained to the tutor's own data.
 *
 * Object-level authorization (P0-1): "constrained to the tutor's own data" was
 * previously just a docstring — only the tutor themselves (or staff) may read it.
 */
@Injectable()
export class TutorDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async summary(tutorId: string, principal: AuthenticatedPrincipal) {
    const tutor = await this.prisma.tutorProfile.findFirst({
      where: { id: tutorId, isDeleted: false },
    });
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');
    this.policy.assertIsSelfOrOperational(principal, tutor.accountId);

    const [activeOfferings, subjects, languages, upcomingAvailability, bookingGroups] =
      await Promise.all([
        this.prisma.tutorOffering.count({ where: { tutorId, status: 'ACTIVE', isDeleted: false } }),
        this.prisma.tutorSubject.count({ where: { tutorId, isDeleted: false, status: 'active' } }),
        this.prisma.tutorLanguage.count({ where: { tutorId, isDeleted: false, status: 'active' } }),
        this.prisma.tutorAvailability.count({
          where: { tutorId, status: 'ACTIVE', isDeleted: false, startAt: { gte: new Date() } },
        }),
        this.prisma.booking.groupBy({
          by: ['status'],
          where: { tutorId, isDeleted: false },
          _count: { _all: true },
        }),
      ]);

    const bookingsByStatus: Record<string, number> = {};
    for (const g of bookingGroups) bookingsByStatus[g.status] = g._count._all;

    return {
      tutorId,
      verificationStatus: tutor.verificationStatus,
      rating: { average: tutor.ratingAverage ? Number(tutor.ratingAverage) : null, count: tutor.ratingCount },
      counts: {
        activeOfferings,
        subjects,
        languages,
        upcomingAvailability,
        bookingsByStatus,
      },
    };
  }
}
