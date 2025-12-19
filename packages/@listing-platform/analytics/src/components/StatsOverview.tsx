'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useListingStats } from '../hooks/useListingStats';
import type { TimeRange } from '../types';

export interface StatsOverviewProps {
  listingId: string;
  timeRange?: TimeRange;
  className?: string;
}

export function StatsOverview({ listingId, timeRange = '30d', className }: StatsOverviewProps) {
  const { stats, isLoading, error } = useListingStats(listingId, { timeRange });

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-100 p-4 h-24" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        Unable to load statistics
      </div>
    );
  }

  const statCards = [
    { label: 'Views', value: stats.views, icon: '👁️' },
    { label: 'Unique Views', value: stats.uniqueViews, icon: '👤' },
    { label: 'Leads', value: stats.leads, icon: '📧' },
    { label: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, icon: '📈' },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
      {statCards.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{stat.icon}</span>
            <span className="text-sm text-gray-500">{stat.label}</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
