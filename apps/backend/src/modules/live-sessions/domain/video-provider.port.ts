/**
 * Video provider PORT (System Architecture §18; Constitution Art. VII/VIII).
 * The domain governs the session lifecycle; the real-time media technology is an
 * ADAPTER behind this port. Any provider (or none) can be swapped without
 * touching domain/application code. No vendor concept leaks past the adapter —
 * only an opaque `mediaReference` is returned.
 */
export interface VideoRoom {
  mediaReference: string;
  joinContext?: Record<string, unknown>;
}

export interface VideoProviderPort {
  /** Create/allocate a media room for a session. Returns an opaque reference. */
  createRoom(sessionId: string): Promise<VideoRoom>;
  /** Produce a join grant for a participant (opaque; provider-specific inside). */
  issueJoin(mediaReference: string, participantAccountId: string): Promise<VideoRoom>;
  /** Release a media room (best-effort). */
  closeRoom(mediaReference: string): Promise<void>;
}

export const VIDEO_PROVIDER = Symbol('VIDEO_PROVIDER');
