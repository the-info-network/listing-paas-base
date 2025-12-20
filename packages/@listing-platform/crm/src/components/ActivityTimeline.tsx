'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useActivities } from '../hooks/useActivities';
import type { Activity, EntityType, ActivityType } from '../types';

export interface ActivityTimelineProps {
  entityId: string;
  entityType: EntityType;
  onLoadMore?: () => void;
  className?: string;
}

const activityIcons: Record<ActivityType, { icon: string; color: string }> = {
  created: { icon: '➕', color: 'bg-green-100 text-green-600' },
  updated: { icon: '✏️', color: 'bg-blue-100 text-blue-600' },
  deleted: { icon: '🗑️', color: 'bg-red-100 text-red-600' },
  note_added: { icon: '📝', color: 'bg-yellow-100 text-yellow-600' },
  email_sent: { icon: '✉️', color: 'bg-purple-100 text-purple-600' },
  call_logged: { icon: '📞', color: 'bg-cyan-100 text-cyan-600' },
  meeting_scheduled: { icon: '📅', color: 'bg-indigo-100 text-indigo-600' },
  task_completed: { icon: '✅', color: 'bg-green-100 text-green-600' },
  deal_won: { icon: '🎉', color: 'bg-green-100 text-green-600' },
  deal_lost: { icon: '❌', color: 'bg-red-100 text-red-600' },
  stage_changed: { icon: '➡️', color: 'bg-orange-100 text-orange-600' },
};

export function ActivityTimeline({
  entityId,
  entityType,
  className,
}: ActivityTimelineProps) {
  const { activities, isLoading, error, hasMore, loadMore } = useActivities(
    entityId,
    entityType
  );

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className={cn('activity-timeline space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('activity-timeline rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        <p className="text-sm text-red-600">Failed to load activities</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn('activity-timeline rounded-lg border border-gray-200 p-6 text-center', className)}>
        <p className="text-gray-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className={cn('activity-timeline', className)}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Activities */}
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const iconConfig = activityIcons[activity.type] || { 
              icon: '•', 
              color: 'bg-gray-100 text-gray-600' 
            };

            return (
              <div key={activity.id} className="relative flex gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm',
                    iconConfig.color
                  )}
                >
                  {iconConfig.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    {activity.userName && (
                      <>
                        <span>{activity.userName}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatTimestamp(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          className="mt-4 w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
