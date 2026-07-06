/**
 * Notification channel PORT (System Architecture §16; Clean Architecture §4.2).
 * The domain depends on this interface; concrete channels (email/SMS/push) are
 * adapters. Adding a channel is configuration/adapter work — no core change.
 */
export interface OutboundNotification {
  recipientAccountId: string;
  channelKey: string;
  templateKey: string;
  language: string;
  payload?: Record<string, unknown>;
}

export interface NotificationChannelPort {
  readonly channelKey: string;
  /** Attempt delivery; returns provider-agnostic outcome. Never throws for a
   *  business failure — the outbox records the attempt (§16.2). */
  deliver(notification: OutboundNotification): Promise<{ ok: boolean; detail?: string }>;
}

export const NOTIFICATION_CHANNELS = Symbol('NOTIFICATION_CHANNELS');
