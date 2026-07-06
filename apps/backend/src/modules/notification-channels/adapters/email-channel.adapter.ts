import { Injectable, Logger } from '@nestjs/common';
import type {
  NotificationChannelPort, OutboundNotification,
} from '../../notifications/domain/notification-channel.port';

/**
 * Email channel adapter (Business Domain Model §16). Implements the EXISTING
 * Phase 1 notification port — additive, no Phase 1 file modified. The concrete
 * email provider is a Pending Technical Decision; this adapter logs the intent
 * and returns success so the pipeline is functional. Privacy: no PII beyond
 * routing metadata is logged (§12.3).
 */
@Injectable()
export class EmailChannelAdapter implements NotificationChannelPort {
  readonly channelKey = 'email';
  private readonly logger = new Logger('NotificationChannel:email');
  async deliver(n: OutboundNotification): Promise<{ ok: boolean; detail?: string }> {
    this.logger.log({ recipient: n.recipientAccountId, template: n.templateKey, language: n.language }, 'Email queued');
    return { ok: true };
  }
}
