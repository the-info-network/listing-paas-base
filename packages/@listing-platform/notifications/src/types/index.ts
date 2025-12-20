/**
 * Types for Notifications SDK
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message' | 'booking' | 'review' | 'payment';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: NotificationChannelPrefs;
  push: NotificationChannelPrefs;
  sms: NotificationChannelPrefs;
  inApp: NotificationChannelPrefs;
}

export interface NotificationChannelPrefs {
  enabled: boolean;
  messages: boolean;
  bookings: boolean;
  reviews: boolean;
  marketing: boolean;
  systemUpdates: boolean;
}

export interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface NotificationFilters {
  type?: NotificationType | NotificationType[];
  isRead?: boolean;
  limit?: number;
  offset?: number;
}
