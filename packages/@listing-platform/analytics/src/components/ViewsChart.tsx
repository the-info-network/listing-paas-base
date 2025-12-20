'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useViewMetrics } from '../hooks/useViewMetrics';
import type { TimeRange } from '../types';

export interface ViewsChartProps {
  listingId: string;
  timeRange?: TimeRange;
  className?: string;
}

export function ViewsChart({ listingId, timeRange = '30d', className }: ViewsChartProps) {
  const { metrics, totalViews, isLoading, error } = useViewMetrics(listingId, { timeRange });

  if (isLoading) {
    return (
      <div className={cn('animate-pulse rounded-lg bg-gray-100 h-64', className)} />
    );
  }

  if (error || metrics.length === 0) {
    return (
      <div className={cn('flex h-64 items-center justify-center rounded-lg border border-gray-200', className)}>
        <p className="text-gray-500">No view data available</p>
      </div>
    );
  }

  const maxViews = Math.max(...metrics.map(m => m.views), 1);

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Views Over Time</h3>
        <span className="text-sm text-gray-500">{totalViews.toLocaleString()} total views</span>
      </div>

      {/* Simple bar chart */}
      <div className="flex h-48 items-end gap-1">
        {metrics.map((metric, index) => {
          const height = (metric.views / maxViews) * 100;
          
          return (
            <div
              key={metric.date}
              className="group relative flex-1"
              title={`${new Date(metric.date).toLocaleDateString()}: ${metric.views} views`}
            >
              <div
                className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap">
                {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {metric.views}
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>{new Date(metrics[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(metrics[metrics.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}
