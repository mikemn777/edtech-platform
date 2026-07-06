import { Module } from '@nestjs/common';
import { LiveSessionController } from './live-session.controller';
import { LiveSessionService } from './application/live-session.service';
import { NullVideoAdapter } from './adapters/null-video.adapter';
import { VIDEO_PROVIDER } from './domain/video-provider.port';

/**
 * Live Sessions module (Business Domain Model §10). Binds the VIDEO_PROVIDER port
 * to a provider-independent adapter (default: null/placeholder). A real media
 * provider is a Pending Technical Decision and plugs in here without touching the
 * domain (Constitution Art. VII).
 */
@Module({
  controllers: [LiveSessionController],
  providers: [
    LiveSessionService,
    NullVideoAdapter,
    { provide: VIDEO_PROVIDER, useExisting: NullVideoAdapter },
  ],
  exports: [LiveSessionService],
})
export class LiveSessionsModule {}
