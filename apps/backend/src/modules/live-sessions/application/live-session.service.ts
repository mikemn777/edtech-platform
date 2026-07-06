import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import { VIDEO_PROVIDER, VideoProviderPort } from '../domain/video-provider.port';
import type { CreateLiveSessionDto } from '../contracts/live-session.dto';

type LiveStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
const TRANSITIONS: Record<LiveStatus, LiveStatus[]> = {
  SCHEDULED: ['IN_PROGRESS', 'NO_SHOW', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
};

/**
 * Live Session service (Business Domain Model §10). Governs the BUSINESS
 * lifecycle of a teaching session; media is delegated to the provider-independent
 * video port (Art. VII). Only VERIFIED tutors may deliver (BR-002). Recording and
 * conduct rules (with minor implications) are Pending Business Decisions (BR-106)
 * and are NOT invented — no recording is initiated here.
 */
@Injectable()
export class LiveSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(VIDEO_PROVIDER) private readonly video: VideoProviderPort,
  ) {}

  async create(dto: CreateLiveSessionDto, actor: string, correlationId?: string) {
    const start = new Date(dto.scheduledStart);
    const end = new Date(dto.scheduledEnd);
    if (end <= start) throw DomainError.validation('scheduledEnd must be after scheduledStart.');

    const tutor = await this.prisma.tutorProfile.findFirst({ where: { id: dto.tutorId, isDeleted: false } });
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');
    if (tutor.verificationStatus !== 'VERIFIED') {
      throw DomainError.forbidden('Tutor is not verified and cannot deliver sessions.');
    }
    const student = await this.prisma.studentProfile.findFirst({ where: { id: dto.studentId, isDeleted: false } });
    if (!student) throw DomainError.notFound('Student profile not found.');

    const session = await this.prisma.liveSession.create({
      data: {
        tutorId: dto.tutorId,
        studentId: dto.studentId,
        bookingId: dto.bookingId ?? null,
        scheduledStart: start,
        scheduledEnd: end,
        createdBy: actor,
      },
    });
    await this.audit.record({ actorAccountId: actor, action: 'livesession.created', entityType: 'LiveSession', entityReference: session.id, classification: 'minor_related', correlationId });
    return { id: session.id, status: session.status };
  }

  async start(sessionId: string, actor: string, correlationId?: string) {
    const session = await this.getOrThrow(sessionId);
    this.assertTransition(session.status as LiveStatus, 'IN_PROGRESS');
    // Allocate a media room via the provider-independent port (opaque ref).
    const room = await this.video.createRoom(sessionId);
    const updated = await this.prisma.liveSession.update({
      where: { id: sessionId },
      data: { status: 'IN_PROGRESS', actualStart: new Date(), mediaReference: room.mediaReference, updatedBy: actor },
    });
    await this.audit.record({ actorAccountId: actor, action: 'livesession.started', entityType: 'LiveSession', entityReference: sessionId, classification: 'minor_related', correlationId });
    return { id: updated.id, status: updated.status };
  }

  async join(sessionId: string, participantAccountId: string) {
    const session = await this.getOrThrow(sessionId);
    if (session.status !== 'IN_PROGRESS' || !session.mediaReference) {
      throw DomainError.conflict('Session is not currently joinable.');
    }
    await this.prisma.sessionAttendance.upsert({
      where: { sessionId_participantAccountId: { sessionId, participantAccountId } },
      update: { joinedAt: new Date(), attendanceStatus: 'present' },
      create: { sessionId, participantAccountId, joinedAt: new Date(), attendanceStatus: 'present' },
    });
    const grant = await this.video.issueJoin(session.mediaReference, participantAccountId);
    return { mediaReference: grant.mediaReference, joinContext: grant.joinContext ?? null };
  }

  async transition(sessionId: string, to: LiveStatus, actor: string, correlationId?: string) {
    const session = await this.getOrThrow(sessionId);
    this.assertTransition(session.status as LiveStatus, to);
    const patch: Record<string, unknown> = { status: to, updatedBy: actor };
    if (to === 'COMPLETED') patch.actualEnd = new Date();
    const updated = await this.prisma.liveSession.update({ where: { id: sessionId }, data: patch });
    if ((to === 'COMPLETED' || to === 'CANCELLED') && session.mediaReference) {
      await this.video.closeRoom(session.mediaReference);
    }
    await this.audit.record({ actorAccountId: actor, action: `livesession.${to.toLowerCase()}`, entityType: 'LiveSession', entityReference: sessionId, classification: 'minor_related', correlationId });
    return { id: updated.id, status: updated.status };
  }

  private assertTransition(from: LiveStatus, to: LiveStatus): void {
    if (!TRANSITIONS[from]?.includes(to)) throw DomainError.conflict(`Illegal session transition ${from} -> ${to}.`);
  }

  private async getOrThrow(sessionId: string) {
    const session = await this.prisma.liveSession.findFirst({ where: { id: sessionId, isDeleted: false } });
    if (!session) throw DomainError.notFound('Live session not found.');
    return session;
  }
}
