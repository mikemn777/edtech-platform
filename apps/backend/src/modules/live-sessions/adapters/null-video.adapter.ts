import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { VideoProviderPort, VideoRoom } from '../domain/video-provider.port';

/**
 * Default video adapter. Provider-independent placeholder that allocates an
 * opaque reference without binding to any vendor (the concrete real-time media
 * provider is a Pending Technical Decision). A real adapter (e.g. WebRTC SFU)
 * implements the same port with zero change to consumers (Art. VII).
 */
@Injectable()
export class NullVideoAdapter implements VideoProviderPort {
  async createRoom(sessionId: string): Promise<VideoRoom> {
    return { mediaReference: `room:${sessionId}:${randomUUID()}` };
  }
  async issueJoin(mediaReference: string, participantAccountId: string): Promise<VideoRoom> {
    return { mediaReference, joinContext: { participant: participantAccountId, grant: randomUUID() } };
  }
  async closeRoom(): Promise<void> {
    /* no-op for the placeholder */
  }
}
