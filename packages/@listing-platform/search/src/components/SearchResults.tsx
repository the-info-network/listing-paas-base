'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { SearchResult } from '../types';

export interface SearchResultsProps {
  results: SearchResult[];
  total: number;
  isLoading?: boolean;
  variant?: 'grid' | 'list';
  onListingClick?: (listing: SearchResult) => void;
  className?: string;
}

export function SearchResults({
  results,
  total,
  isLoading = false,
  variant = 'grid',
  onListingClick,
  className,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={cn(
        variant === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4',
        className
      )}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-100 h-64" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500">No results found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">{total} results found</p>
      
      <div className={cn(
        variant === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4',
        className
      )}>
        {results.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            variant={variant}
            onClick={() => onListingClick?.(result)}
          />
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  result,
  variant,
  onClick,
}: {
  result: SearchResult;
  variant: 'grid' | 'list';
  onClick?: () => void;
}) {
  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex gap-4 rounded-lg border border-gray-200 bg-white p-4',
          onClick && 'cursor-pointer hover:border-gray-300 hover:shadow-sm'
        )}
      >
        {result.featuredImage ? (
          <img
            src={result.featuredImage}
            alt={result.title}
            className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
          {result.location && (
            <p className="text-sm text-gray-500">
              {[result.location.city, result.location.region].filter(Boolean).join(', ')}
            </p>
          )}
          {result.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{result.description}</p>
          )}
          <div className="mt-2 flex items-center gap-4">
            {result.price !== undefined && (
              <span className="font-medium text-gray-900">
                {formatPrice(result.price, result.currency)}
              </span>
            )}
            {result.rating !== undefined && (
              <span className="flex items-center text-sm text-gray-500">
                ⭐ {result.rating} ({result.reviewCount})
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-lg border border-gray-200 bg-white',
        onClick && 'cursor-pointer hover:border-gray-300 hover:shadow-md'
      )}
    >
      <div className="aspect-[4/3]">
        {result.featuredImage ? (
          <img
            src={result.featuredImage}
            alt={result.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
        {result.location && (
          <p className="text-sm text-gray-500">
            {[result.location.city, result.location.region].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          {result.price !== undefined && (
            <span className="font-medium text-gray-900">
              {formatPrice(result.price, result.currency)}
            </span>
          )}
          {result.rating !== undefined && (
            <span className="text-sm text-gray-500">
              ⭐ {result.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
