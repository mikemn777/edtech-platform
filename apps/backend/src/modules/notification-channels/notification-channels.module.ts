import { Global, Module } from '@nestjs/common';
import { EmailChannelAdapter } from './adapters/email-channel.adapter';
import { SmsChannelAdapter } from './adapters/sms-channel.adapter';
import { PushChannelAdapter } from './adapters/push-channel.adapter';
import { MultiChannelNotificationService } from './multi-channel.service';

/**
 * Notification Channels module — Email/SMS/Push (Business Domain Model §16).
 * Additive to the Phase 1 Notifications infrastructure; reuses its port. Global
 * so other domains can dispatch across channels.
 */
@Global()
@Module({
  providers: [EmailChannelAdapter, SmsChannelAdapter, PushChannelAdapter, MultiChannelNotificationService],
  exports: [MultiChannelNotificationService],
})
export class NotificationChannelsModule {}
