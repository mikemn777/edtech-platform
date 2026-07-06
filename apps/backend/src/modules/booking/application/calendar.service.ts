import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

/**
 * Calendar service (Business Domain Model §9). Presents time-based commitments —
 * it records/presents, it does not decide (Scheduling) or deliver. Here it
 * aggregates a tutor's active availability windows and non-terminal bookings into
 * a single timeline. All times are absolute (UTC); the consumer renders them in
 * the actor's timezone (DB Arch §13).
 */
@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async tutorCalendar(tutorId: string, from: Date, to: Date) {
    const [availability, bookings] = await Promise.all([
      this.prisma.tutorAvailability.findMany({
        where: {
          tutorId,
          status: 'ACTIVE',
          isDeleted: false,
          startAt: { lt: to },
          endAt: { gt: from },
        },
        select: { id: true, startAt: true, endAt: true },
        orderBy: { startAt: 'asc' },
      }),
      this.prisma.booking.findMany({
        where: {
          tutorId,
          isDeleted: false,
          status: { in: ['REQUESTED', 'CONFIRMED'] },
          scheduledStart: { lt: to },
          scheduledEnd: { gt: from },
        },
        select: { id: true, scheduledStart: true, scheduledEnd: true, status: true },
        orderBy: { scheduledStart: 'asc' },
      }),
    ]);

    return {
      tutorId,
      range: { from, to },
      availability: availability.map((a) => ({
        id: a.id,
        type: 'availability' as const,
        start: a.startAt,
        end: a.endAt,
      })),
      bookings: bookings.map((b) => ({
        id: b.id,
        type: 'booking' as const,
        start: b.scheduledStart,
        end: b.scheduledEnd,
        status: b.status,
      })),
    };
  }
}
