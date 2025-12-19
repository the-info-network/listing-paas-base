'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export interface NotificationCenterProps {
  onClose?: () => void;
  onNotificationClick?: (actionUrl: string) => void;
  className?: string;
}

export function NotificationCenter({ onClose, onNotificationClick, className }: NotificationCenterProps) {
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications({ limit: 50 });

  return (
    <div className={cn('flex flex-col rounded-lg border border-gray-200 bg-white shadow-lg', className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:underline">Mark all read</button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications</div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
                onDelete={() => deleteNotification(notification.id)}
                onClick={() => notification.actionUrl && onNotificationClick?.(notification.actionUrl)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
