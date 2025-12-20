'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import type { NotificationChannelPrefs } from '../types';

export interface NotificationPreferencesFormProps {
  className?: string;
}

export function NotificationPreferencesForm({ className }: NotificationPreferencesFormProps) {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();

  if (isLoading || !preferences) {
    return <div className={cn('animate-pulse h-64 rounded-lg bg-gray-100', className)} />;
  }

  const channels = [
    { key: 'email' as const, label: 'Email', icon: '📧' },
    { key: 'push' as const, label: 'Push', icon: '🔔' },
    { key: 'inApp' as const, label: 'In-App', icon: '📱' },
  ];

  const categories = ['messages', 'bookings', 'reviews', 'marketing', 'systemUpdates'] as const;
  const categoryLabels: Record<string, string> = {
    messages: 'Messages', bookings: 'Bookings', reviews: 'Reviews',
    marketing: 'Marketing', systemUpdates: 'System Updates',
  };

  const handleToggle = (channel: keyof typeof preferences, category: keyof NotificationChannelPrefs) => {
    const current = preferences[channel];
    updatePreferences({ [channel]: { ...current, [category]: !current[category] } });
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white', className)}>
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Notification Preferences</h3>
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-3">Category</th>
              {channels.map(c => <th key={c.key} className="pb-3 text-center">{c.icon} {c.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map(category => (
              <tr key={category}>
                <td className="py-3">{categoryLabels[category]}</td>
                {channels.map(channel => (
                  <td key={channel.key} className="py-3 text-center">
                    <input
                      type="checkbox"
                      checked={preferences[channel.key][category]}
                      onChange={() => handleToggle(channel.key, category)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
