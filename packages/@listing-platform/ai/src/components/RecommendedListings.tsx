'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useAIRecommendations } from '../hooks/useAIRecommendations';

export interface RecommendedListingsProps {
  userId?: string;
  limit?: number;
  onListingClick?: (listingId: string) => void;
  className?: string;
}

export function RecommendedListings({ userId, limit = 6, onListingClick, className }: RecommendedListingsProps) {
  const { recommendations, isLoading, error } = useAIRecommendations(userId, limit);

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: limit }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100" />)}
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {recommendations.map(rec => (
        <button key={rec.listingId} onClick={() => onListingClick?.(rec.listingId)} className="group rounded-lg border border-gray-200 overflow-hidden text-left hover:shadow-md transition-shadow">
          {rec.listing.imageUrl && <img src={rec.listing.imageUrl} alt="" className="h-32 w-full object-cover" />}
          <div className="p-3">
            <h4 className="font-medium text-gray-900 group-hover:text-blue-600">{rec.listing.title}</h4>
            {rec.listing.price && <p className="text-sm text-gray-600">${rec.listing.price.toLocaleString()}</p>}
            {rec.reason && <p className="mt-1 text-xs text-gray-400">✨ {rec.reason}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}
