import { Injectable, Logger } from '@nestjs/common';
import type {
  NotificationChannelPort, OutboundNotification,
} from '../../notifications/domain/notification-channel.port';

/** SMS channel adapter (provider = PTD; additive to Phase 1 port). */
@Injectable()
export class SmsChannelAdapter implements NotificationChannelPort {
  readonly channelKey = 'sms';
  private readonly logger = new Logger('NotificationChannel:sms');
  async deliver(n: OutboundNotification): Promise<{ ok: boolean; detail?: string }> {
    this.logger.log({ recipient: n.recipientAccountId, template: n.templateKey }, 'SMS queued');
    return { ok: true };
  }
}
