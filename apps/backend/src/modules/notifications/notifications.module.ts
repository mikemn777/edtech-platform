import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { LogChannelAdapter } from './adapters/log-channel.adapter';
import { NOTIFICATION_CHANNELS } from './domain/notification-channel.port';

/**
 * Notification module (module 17). Registers channel adapters behind the port.
 * Additional channels are added to this provider array — no consumer change.
 */
@Global()
@Module({
  providers: [
    LogChannelAdapter,
    {
      provide: NOTIFICATION_CHANNELS,
      useFactory: (logChannel: LogChannelAdapter) => [logChannel],
      inject: [LogChannelAdapter],
    },
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
