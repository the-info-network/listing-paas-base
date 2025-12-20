'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationFilters } from '../types';

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(filters?: NotificationFilters): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        types.forEach(t => params.append('type', t));
      }
      if (filters?.isRead !== undefined) params.set('isRead', String(filters.isRead));
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications((data.data || []).map(mapNotificationFromApi));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.type, filters?.isRead, filters?.limit, filters?.offset]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead, deleteNotification, refetch: fetchNotifications };
}

function mapNotificationFromApi(data: Record<string, unknown>): Notification {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    type: data.type as Notification['type'],
    title: data.title as string,
    message: data.message as string,
    data: data.data as Record<string, unknown> | undefined,
    actionUrl: data.action_url as string | undefined,
    imageUrl: data.image_url as string | undefined,
    isRead: data.is_read as boolean,
    readAt: data.read_at as string | undefined,
    createdAt: data.created_at as string,
  };
}
