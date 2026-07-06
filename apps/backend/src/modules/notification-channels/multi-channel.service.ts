import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../audit/application/audit.service';
import type { OutboundNotification, NotificationChannelPort } from '../notifications/domain/notification-channel.port';
import { EmailChannelAdapter } from './adapters/email-channel.adapter';
import { SmsChannelAdapter } from './adapters/sms-channel.adapter';
import { PushChannelAdapter } from './adapters/push-channel.adapter';
import { DomainError } from '../../platform/errors/domain-error';

/**
 * Multi-channel dispatch facade (Business Domain Model §16). Composes the new
 * Email/SMS/Push adapters behind the existing port interface. Consent/contact
 * rules — especially for minors — are Pending Business/Legal Decisions (BR-103);
 * dispatch here is infrastructure only and records the attempt.
 */
@Injectable()
export class MultiChannelNotificationService {
  private readonly logger = new Logger(MultiChannelNotificationService.name);
  private readonly channels = new Map<string, NotificationChannelPort>();

  constructor(
    email: EmailChannelAdapter,
    sms: SmsChannelAdapter,
    push: PushChannelAdapter,
    private readonly audit: AuditService,
  ) {
    for (const ch of [email, sms, push]) this.channels.set(ch.channelKey, ch);
  }

  channelKeys(): string[] {
    return [...this.channels.keys()];
  }

  async send(channelKey: string, notification: OutboundNotification, correlationId?: string): Promise<boolean> {
    const channel = this.channels.get(channelKey);
    if (!channel) throw DomainError.validation(`Unknown channel: ${channelKey}`);
    const result = await channel.deliver(notification);
    await this.audit.record({
      action: 'notification.channel.dispatched',
      entityType: 'Notification',
      entityReference: notification.recipientAccountId,
      authorityContext: { channel: channelKey, outcome: result.ok ? 'sent' : 'failed' },
      classification: 'operational',
      correlationId,
    });
    return result.ok;
  }
}
