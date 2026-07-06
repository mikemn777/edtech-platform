import { Injectable, Logger } from '@nestjs/common';
import type {
  NotificationChannelPort, OutboundNotification,
} from '../../notifications/domain/notification-channel.port';

/** Push channel adapter (provider = PTD; additive to Phase 1 port). */
@Injectable()
export class PushChannelAdapter implements NotificationChannelPort {
  readonly channelKey = 'push';
  private readonly logger = new Logger('NotificationChannel:push');
  async deliver(n: OutboundNotification): Promise<{ ok: boolean; detail?: string }> {
    this.logger.log({ recipient: n.recipientAccountId, template: n.templateKey }, 'Push queued');
    return { ok: true };
  }
}
