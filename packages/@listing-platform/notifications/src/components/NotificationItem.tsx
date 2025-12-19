'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { Notification } from '../types';

export interface NotificationItemProps {
  notification: Notification;
  onRead?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

const typeIcons: Record<string, string> = {
  info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌',
  message: '💬', booking: '📅', review: '⭐', payment: '💳',
};

export function NotificationItem({ notification, onRead, onDelete, onClick }: NotificationItemProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={() => { if (!notification.isRead) onRead?.(); onClick?.(); }}
      className={cn(
        'flex gap-3 p-3',
        !notification.isRead && 'bg-blue-50',
        onClick && 'cursor-pointer hover:bg-gray-50'
      )}
    >
      <span className="text-xl">{typeIcons[notification.type] || 'ℹ️'}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !notification.isRead && 'font-medium')}>{notification.title}</p>
        <p className="text-sm text-gray-500 truncate">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
      </div>
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-400 hover:text-red-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
