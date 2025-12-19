'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useSimilarListings } from '../hooks/useSimilarListings';

export interface SimilarListingsProps {
  listingId: string;
  limit?: number;
  onListingClick?: (listingId: string) => void;
  className?: string;
}

export function SimilarListings({ listingId, limit = 4, onListingClick, className }: SimilarListingsProps) {
  const { similar, isLoading } = useSimilarListings(listingId, limit);

  if (isLoading) {
    return (
      <div className={cn('grid gap-3 grid-cols-2 md:grid-cols-4', className)}>
        {Array.from({ length: limit }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded bg-gray-100" />)}
      </div>
    );
  }

  if (similar.length === 0) return null;

  return (
    <div className={cn('grid gap-3 grid-cols-2 md:grid-cols-4', className)}>
      {similar.map(item => (
        <button key={item.listingId} onClick={() => onListingClick?.(item.listingId)} className="rounded-lg border overflow-hidden text-left hover:shadow-md">
          {item.listing.imageUrl && <img src={item.listing.imageUrl} alt="" className="h-24 w-full object-cover" />}
          <div className="p-2">
            <p className="text-sm font-medium truncate">{item.listing.title}</p>
            <p className="text-xs text-gray-500">{Math.round(item.similarity * 100)}% match</p>
          </div>
        </button>
      ))}
    </div>
  );
}
