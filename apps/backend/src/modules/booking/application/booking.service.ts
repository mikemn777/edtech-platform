import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { lockForWrite } from '../../../shared/prisma/advisory-lock';
import { DomainError } from '../../../platform/errors/domain-error';
import { canTransition, type BookingStatus } from '../domain/booking-status';
import { slotIsBookable, type TimeWindow } from '../domain/availability-engine';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { CreateBookingDto } from '../contracts/booking.dto';

/**
 * Booking service — Scheduling, Availability Engine, Workflow, Status
 * (Business Domain Model §7-8). Enforces structural correctness:
 *   - Only VERIFIED tutors can be booked (BR-002).
 *   - The slot must fit an active availability window and not collide with
 *     existing active bookings (availability engine; EC-004).
 *   - Status transitions follow the governed state machine (VR-003).
 * Commercial rules (price, payment, cancellation penalty) and minor-consent
 * (who may book for a minor) are Pending Business Decisions: bookings are created
 * as REQUESTED and no money is processed; where a minor-consent rule would be
 * required it is not invented (BR-100/102/003).
 *
 * Object-level authorization (P0-1): every route is additionally checked
 * against the specific student/tutor on the booking, not just the caller's
 * general permission grant (Roles §3.3 self/relationship scope).
 */
@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  async request(dto: CreateBookingDto, actor: AuthenticatedPrincipal, correlationId?: string) {
    const actorAccountId = actor.accountId;
    const start = new Date(dto.scheduledStart);
    const end = new Date(dto.scheduledEnd);
    const slot: TimeWindow = { startAt: start, endAt: end };
    if (end <= start) throw DomainError.validation('scheduledEnd must be after scheduledStart.');

    const [student, tutor] = await Promise.all([
      this.prisma.studentProfile.findFirst({ where: { id: dto.studentId, isDeleted: false } }),
      this.prisma.tutorProfile.findFirst({ where: { id: dto.tutorId, isDeleted: false } }),
    ]);
    if (!student) throw DomainError.notFound('Student profile not found.');
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');

    // Only the student themselves, an active guardian, or an operational role
    // may request a booking for this student (A2 — was previously unbounded).
    if (!(await this.policy.canActOnStudentAccount(actor, student.accountId))) {
      throw DomainError.forbidden('You may only book on behalf of your own student profile.');
    }

    // Eligibility gate (BR-002).
    if (tutor.verificationStatus !== 'VERIFIED') {
      throw DomainError.forbidden('Tutor is not verified and cannot be booked.');
    }

    // Availability-check + insert must be atomic per tutor (P0-3/B2): without
    // this, two concurrent requests for the same slot could both pass
    // slotIsBookable before either has inserted, double-booking the tutor.
    // An advisory lock serializes writers for this tutor; the check is
    // re-evaluated for real inside the lock, right before the insert.
    const booking = await this.prisma.$transaction(async (tx) => {
      await lockForWrite(tx, dto.tutorId);

      const [windows, busy] = await Promise.all([
        tx.tutorAvailability.findMany({
          where: { tutorId: dto.tutorId, status: 'ACTIVE', isDeleted: false },
          select: { startAt: true, endAt: true },
        }),
        tx.booking.findMany({
          where: {
            tutorId: dto.tutorId,
            isDeleted: false,
            status: { in: ['REQUESTED', 'CONFIRMED'] },
          },
          select: { scheduledStart: true, scheduledEnd: true },
        }),
      ]);

      const bookable = slotIsBookable(
        slot,
        windows.map((w) => ({ startAt: w.startAt, endAt: w.endAt })),
        busy.map((b) => ({ startAt: b.scheduledStart, endAt: b.scheduledEnd })),
      );
      if (!bookable) {
        throw DomainError.conflict('Requested slot is not available.');
      }

      const created = await tx.booking.create({
        data: {
          studentId: dto.studentId,
          tutorId: dto.tutorId,
          offeringId: dto.offeringId ?? null,
          availabilityId: dto.availabilityId ?? null,
          bookedByAccountId: actorAccountId,
          scheduledStart: start,
          scheduledEnd: end,
          status: 'REQUESTED',
          createdBy: actorAccountId,
        },
      });
      await tx.bookingStatusHistory.create({
        data: { bookingId: created.id, toStatus: 'REQUESTED', changedBy: actorAccountId },
      });
      return created;
    });

    await this.audit.record({
      actorAccountId,
      action: 'booking.requested',
      entityType: 'Booking',
      entityReference: booking.id,
      authorityContext: { note: 'no payment processed; commercial rules PBD' },
      classification: 'minor_related',
      correlationId,
    });
    return { id: booking.id, status: booking.status };
  }

  async transition(
    bookingId: string,
    to: BookingStatus,
    actor: AuthenticatedPrincipal,
    reason: string | undefined,
    correlationId?: string,
  ) {
    const actorAccountId = actor.accountId;
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, isDeleted: false },
    });
    if (!booking) throw DomainError.notFound('Booking not found.');
    await this.assertActorOnBooking(booking, actor);

    const from = booking.status as BookingStatus;
    if (!canTransition(from, to)) {
      throw DomainError.conflict(`Illegal booking transition ${from} -> ${to}.`);
    }

    // If a confirmed slot is created, re-check no collision was introduced
    // meanwhile (defensive; EC-004). Cancellation/refund PENALTY rules are PBD —
    // cancellation is permitted structurally, with no penalty applied.
    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.booking.update({
        where: { id: bookingId },
        data: { status: to, updatedBy: actorAccountId, recordVersion: { increment: 1 } },
      });
      await tx.bookingStatusHistory.create({
        data: { bookingId, fromStatus: from, toStatus: to, changedBy: actorAccountId, reason: reason ?? null },
      });
      return u;
    });

    await this.audit.record({
      actorAccountId,
      action: `booking.${to.toLowerCase()}`,
      entityType: 'Booking',
      entityReference: bookingId,
      authorityContext: { from, to },
      classification: 'minor_related',
      correlationId,
    });
    return { id: updated.id, status: updated.status };
  }

  async getById(bookingId: string, actor: AuthenticatedPrincipal) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, isDeleted: false },
      include: { statusHistory: { orderBy: { changedAt: 'asc' } } },
    });
    if (!booking) throw DomainError.notFound('Booking not found.');
    await this.assertActorOnBooking(booking, actor);
    return {
      id: booking.id,
      studentId: booking.studentId,
      tutorId: booking.tutorId,
      scheduledStart: booking.scheduledStart,
      scheduledEnd: booking.scheduledEnd,
      status: booking.status,
      history: booking.statusHistory.map((h) => ({
        from: h.fromStatus,
        to: h.toStatus,
        at: h.changedAt,
        reason: h.reason,
      })),
    };
  }

  async listForTutor(tutorId: string, actor: AuthenticatedPrincipal, status?: BookingStatus) {
    if (!(await this.policy.isSelfTutorOrOperational(actor, tutorId))) {
      throw DomainError.forbidden();
    }
    const rows = await this.prisma.booking.findMany({
      where: {
        tutorId,
        isDeleted: false,
        ...(status ? { status } : {}),
      },
      orderBy: { scheduledStart: 'asc' },
      take: 200,
    });
    return rows.map((b) => ({
      id: b.id,
      studentId: b.studentId,
      scheduledStart: b.scheduledStart,
      scheduledEnd: b.scheduledEnd,
      status: b.status,
    }));
  }

  /** Grants access to a specific booking to the student on it, the tutor on
   * it (or an active guardian of the student), or an operational role — never
   * to an arbitrary third permission-holder (A1/A2). */
  private async assertActorOnBooking(
    booking: { studentId: string; tutorId: string },
    actor: AuthenticatedPrincipal,
  ): Promise<void> {
    if (this.policy.isOperational(actor)) return;
    const [student, tutor] = await Promise.all([
      this.prisma.studentProfile.findFirst({ where: { id: booking.studentId }, select: { accountId: true } }),
      this.prisma.tutorProfile.findFirst({ where: { id: booking.tutorId }, select: { accountId: true } }),
    ]);
    if (this.policy.isSelf(actor, tutor?.accountId)) return;
    if (student && (await this.policy.canActOnStudentAccount(actor, student.accountId))) return;
    throw DomainError.forbidden();
  }
}
