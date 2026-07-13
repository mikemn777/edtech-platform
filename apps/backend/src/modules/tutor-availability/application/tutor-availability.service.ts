import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { CreateAvailabilityDto } from '../contracts/availability.dto';

/**
 * Tutor Availability service (Business Domain Model §5). Manages availability
 * intent windows. Enforces temporal integrity (end after start) and prevents
 * overlapping active windows for the same tutor (a structural correctness rule,
 * distinct from booking/scheduling business rules which remain PBD).
 *
 * Object-level authorization (P0-1): only the tutor themselves (or staff) may
 * manage their own availability windows.
 */
@Injectable()
export class TutorAvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  async create(
    tutorId: string,
    dto: CreateAvailabilityDto,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    const tutor = await this.prisma.tutorProfile.findFirst({
      where: { id: tutorId, isDeleted: false },
    });
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');
    this.policy.assertIsSelfOrOperational(principal, tutor.accountId);

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt <= startAt) {
      throw DomainError.validation('endAt must be after startAt.');
    }

    // Prevent overlapping ACTIVE windows (temporal integrity — Requirements EC-004).
    const overlap = await this.prisma.tutorAvailability.findFirst({
      where: {
        tutorId,
        status: 'ACTIVE',
        isDeleted: false,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });
    if (overlap) throw DomainError.conflict('Overlapping availability window exists.');

    const created = await this.prisma.tutorAvailability.create({
      data: {
        tutorId,
        startAt,
        endAt,
        recurrence: dto.recurrence ?? undefined,
        createdBy: actorAccountId,
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'tutor.availability.created',
      entityType: 'TutorAvailability',
      entityReference: created.id,
      correlationId,
    });
    return { id: created.id, startAt: created.startAt, endAt: created.endAt, status: created.status };
  }

  async list(tutorId: string) {
    const rows = await this.prisma.tutorAvailability.findMany({
      where: { tutorId, isDeleted: false, status: 'ACTIVE' },
      orderBy: { startAt: 'asc' },
    });
    return rows.map((r) => ({ id: r.id, startAt: r.startAt, endAt: r.endAt, status: r.status }));
  }

  async cancel(availabilityId: string, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actorAccountId = principal.accountId;
    const row = await this.prisma.tutorAvailability.findFirst({
      where: { id: availabilityId, isDeleted: false },
    });
    if (!row) throw DomainError.notFound('Availability window not found.');
    if (!(await this.policy.isSelfTutorOrOperational(principal, row.tutorId))) throw DomainError.forbidden();
    await this.prisma.tutorAvailability.update({
      where: { id: availabilityId },
      data: { status: 'CANCELLED', updatedBy: actorAccountId, recordVersion: { increment: 1 } },
    });
    await this.audit.record({
      actorAccountId,
      action: 'tutor.availability.cancelled',
      entityType: 'TutorAvailability',
      entityReference: availabilityId,
      correlationId,
    });
    return { id: availabilityId, status: 'CANCELLED' };
  }
}
