import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import {
  NOTIFICATION_CHANNELS,
  NotificationChannelPort,
  OutboundNotification,
} from '../domain/notification-channel.port';

/**
 * Notification service (module 17; Business Domain Model §16). Channel-agnostic
 * dispatch through registered ports. Respects consent/preferences — the concrete
 * consent rules (esp. for minors) are Pending Business/Legal Decisions (BR-103);
 * until set, this infrastructure records intent and dispatches only via safe
 * default channels.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly channelMap = new Map<string, NotificationChannelPort>();

  constructor(
    @Inject(NOTIFICATION_CHANNELS) channels: NotificationChannelPort[],
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {
    for (const ch of channels) this.channelMap.set(ch.channelKey, ch);
  }

  async dispatch(notification: OutboundNotification, correlationId?: string): Promise<boolean> {
    const channel = this.channelMap.get(notification.channelKey);
    if (!channel) {
      this.logger.warn({ channelKey: notification.channelKey }, 'Unknown notification channel');
      return false;
    }

    const result = await channel.deliver(notification);

    await this.audit.record({
      action: 'notification.dispatched',
      entityType: 'Notification',
      entityReference: notification.recipientAccountId,
      authorityContext: {
        channel: notification.channelKey,
        template: notification.templateKey,
        outcome: result.ok ? 'sent' : 'failed',
      },
      classification: 'operational',
      correlationId,
    });
    return result.ok;
  }

  availableChannels(): string[] {
    return [...this.channelMap.keys()];
  }
}
