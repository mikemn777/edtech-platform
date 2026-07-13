import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import { VIDEO_PROVIDER, VideoProviderPort } from '../domain/video-provider.port';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
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
    private readonly policy: PolicyService,
    @Inject(VIDEO_PROVIDER) private readonly video: VideoProviderPort,
  ) {}

  async create(dto: CreateLiveSessionDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const start = new Date(dto.scheduledStart);
    const end = new Date(dto.scheduledEnd);
    if (end <= start) throw DomainError.validation('scheduledEnd must be after scheduledStart.');

    const tutor = await this.prisma.tutorProfile.findFirst({ where: { id: dto.tutorId, isDeleted: false } });
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');
    if (tutor.verificationStatus !== 'VERIFIED') {
      throw DomainError.forbidden('Tutor is not verified and cannot deliver sessions.');
    }
    // Only the tutor themselves (or an operational role) may schedule a session
    // under their name — otherwise any LIVE_SESSION_MANAGE holder could book any
    // verified tutor's calendar (A2).
    this.policy.assertIsSelfOrOperational(principal, tutor.accountId);

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

  async start(sessionId: string, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const session = await this.getOrThrow(sessionId);
    await this.assertIsSessionTutor(session, principal);
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

  async join(sessionId: string, principal: AuthenticatedPrincipal) {
    const session = await this.getOrThrow(sessionId);
    // A media join grant hands out a live room credential for a minor-related
    // session — restrict strictly to the two assigned parties (or staff), never
    // to any other LIVE_SESSION_JOIN holder who happens to know the id (A1/A2).
    await this.assertIsSessionParty(session, principal);
    if (session.status !== 'IN_PROGRESS' || !session.mediaReference) {
      throw DomainError.conflict('Session is not currently joinable.');
    }
    const participantAccountId = principal.accountId;
    await this.prisma.sessionAttendance.upsert({
      where: { sessionId_participantAccountId: { sessionId, participantAccountId } },
      update: { joinedAt: new Date(), attendanceStatus: 'present' },
      create: { sessionId, participantAccountId, joinedAt: new Date(), attendanceStatus: 'present' },
    });
    const grant = await this.video.issueJoin(session.mediaReference, participantAccountId);
    return { mediaReference: grant.mediaReference, joinContext: grant.joinContext ?? null };
  }

  async transition(sessionId: string, to: LiveStatus, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const session = await this.getOrThrow(sessionId);
    await this.assertIsSessionTutor(session, principal);
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

  /** Only the tutor delivering this specific session (or staff) may start/complete/cancel it. */
  private async assertIsSessionTutor(
    session: { tutorId: string },
    principal: AuthenticatedPrincipal,
  ): Promise<void> {
    if (this.policy.isOperational(principal)) return;
    const accountId = await this.policy.resolveTutorAccountId(session.tutorId);
    if (!this.policy.isSelf(principal, accountId)) throw DomainError.forbidden();
  }

  /** Only the tutor delivering, the assigned student (or their active guardian), or staff may join/view. */
  private async assertIsSessionParty(
    session: { tutorId: string; studentId: string },
    principal: AuthenticatedPrincipal,
  ): Promise<void> {
    if (this.policy.isOperational(principal)) return;
    const tutorAccountId = await this.policy.resolveTutorAccountId(session.tutorId);
    if (this.policy.isSelf(principal, tutorAccountId)) return;
    if (await this.policy.canActOnStudentProfile(principal, session.studentId)) return;
    throw DomainError.forbidden();
  }

  private async getOrThrow(sessionId: string) {
    const session = await this.prisma.liveSession.findFirst({ where: { id: sessionId, isDeleted: false } });
    if (!session) throw DomainError.notFound('Live session not found.');
    return session;
  }
}
