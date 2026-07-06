import { Injectable, Logger } from '@nestjs/common';
import type {
  NotificationChannelPort,
  OutboundNotification,
} from '../domain/notification-channel.port';

/**
 * Default in-app/log channel adapter. A safe, provider-independent default so the
 * notification pipeline is functional in Phase 1; real providers (email/SMS/push)
 * are added as adapters behind the same port (concrete providers are PTDs).
 */
@Injectable()
export class LogChannelAdapter implements NotificationChannelPort {
  readonly channelKey = 'in_app';
  private readonly logger = new Logger('NotificationChannel:in_app');

  async deliver(n: OutboundNotification): Promise<{ ok: boolean; detail?: string }> {
    // Privacy: log only non-sensitive routing metadata (§12.3).
    this.logger.log(
      { recipient: n.recipientAccountId, template: n.templateKey, language: n.language },
      'Notification dispatched (in_app)',
    );
    return { ok: true };
  }
}
