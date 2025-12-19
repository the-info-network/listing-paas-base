'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useTopListings } from '../hooks/useTopListings';
import type { TimeRange } from '../types';

export interface TopListingsProps {
  timeRange?: TimeRange;
  limit?: number;
  onListingClick?: (listingId: string) => void;
  className?: string;
}

export function TopListings({
  timeRange = '30d',
  limit = 5,
  onListingClick,
  className,
}: TopListingsProps) {
  const { listings, isLoading, error } = useTopListings({ timeRange, limit });

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-12 w-12 rounded bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || listings.length === 0) {
    return (
      <div className={cn('py-8 text-center text-gray-500', className)}>
        No listing data available
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white', className)}>
      <div className="border-b px-4 py-3">
        <h3 className="font-medium text-gray-900">Top Performing Listings</h3>
      </div>

      <div className="divide-y">
        {listings.map((listing, index) => (
          <button
            key={listing.id}
            onClick={() => onListingClick?.(listing.id)}
            className={cn(
              'flex w-full items-center gap-3 p-3 text-left',
              onListingClick && 'hover:bg-gray-50'
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
              {index + 1}
            </span>

            {listing.featuredImage ? (
              <img
                src={listing.featuredImage}
                alt={listing.title}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-gray-900">{listing.title}</p>
              <p className="text-sm text-gray-500">
                {listing.views.toLocaleString()} views · {listing.leads} leads
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {listing.conversionRate.toFixed(1)}%
              </p>
              <p className={cn(
                'text-xs',
                listing.trend === 'up' ? 'text-green-600' : 
                listing.trend === 'down' ? 'text-red-600' : 'text-gray-500'
              )}>
                {listing.trend === 'up' ? '↑' : listing.trend === 'down' ? '↓' : '→'} 
                {listing.trendPercent.toFixed(0)}%
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
