'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NotificationPreferences } from '../types';

interface UseNotificationPreferencesResult {
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

const defaultPrefs: NotificationPreferences = {
  email: { enabled: true, messages: true, bookings: true, reviews: true, marketing: false, systemUpdates: true },
  push: { enabled: true, messages: true, bookings: true, reviews: true, marketing: false, systemUpdates: true },
  sms: { enabled: false, messages: false, bookings: false, reviews: false, marketing: false, systemUpdates: false },
  inApp: { enabled: true, messages: true, bookings: true, reviews: true, marketing: true, systemUpdates: true },
};

export function useNotificationPreferences(): UseNotificationPreferencesResult {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const response = await fetch('/api/notifications/preferences');
        if (response.ok) {
          const data = await response.json();
          setPreferences(data.preferences || defaultPrefs);
        } else {
          setPreferences(defaultPrefs);
        }
      } catch {
        setPreferences(defaultPrefs);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...prefs } as NotificationPreferences;
    setPreferences(updated);
    await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }, [preferences]);

  return { preferences, isLoading, updatePreferences };
}
