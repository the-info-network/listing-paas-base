'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useListingStats } from '../hooks/useListingStats';

export interface LeadFunnelProps {
  listingId: string;
  className?: string;
}

export function LeadFunnel({ listingId, className }: LeadFunnelProps) {
  const { stats, isLoading, error } = useListingStats(listingId);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse rounded-lg bg-gray-100 h-48', className)} />
    );
  }

  if (error || !stats) {
    return (
      <div className={cn('flex h-48 items-center justify-center rounded-lg border border-gray-200', className)}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const funnelSteps = [
    { label: 'Impressions', value: stats.impressions, color: 'bg-gray-200' },
    { label: 'Views', value: stats.views, color: 'bg-blue-200' },
    { label: 'Leads', value: stats.leads, color: 'bg-green-200' },
    { label: 'Conversions', value: stats.conversions, color: 'bg-green-400' },
  ];

  const maxValue = Math.max(...funnelSteps.map(s => s.value), 1);

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <h3 className="mb-4 font-medium text-gray-900">Conversion Funnel</h3>

      <div className="space-y-3">
        {funnelSteps.map((step, index) => {
          const width = (step.value / maxValue) * 100;
          const prevValue = index > 0 ? funnelSteps[index - 1].value : null;
          const dropRate = prevValue && prevValue > 0 
            ? ((prevValue - step.value) / prevValue * 100).toFixed(1) 
            : null;

          return (
            <div key={step.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">{step.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{step.value.toLocaleString()}</span>
                  {dropRate && (
                    <span className="text-xs text-red-500">-{dropRate}%</span>
                  )}
                </div>
              </div>
              <div className="h-6 w-full rounded bg-gray-100">
                <div
                  className={cn('h-full rounded transition-all', step.color)}
                  style={{ width: `${Math.max(width, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Overall Conversion Rate</span>
          <span className="font-medium text-green-600">{stats.conversionRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
