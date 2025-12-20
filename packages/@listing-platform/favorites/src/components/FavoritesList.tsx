'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useFavorites } from '../hooks/useFavorites';
import type { SavedListing, FavoritesFilters } from '../types';

export interface FavoritesListProps {
  filters?: FavoritesFilters;
  variant?: 'grid' | 'list';
  onListingClick?: (listing: SavedListing) => void;
  onRemove?: (listingId: string) => void;
  emptyMessage?: string;
  className?: string;
}

export function FavoritesList({
  filters,
  variant = 'grid',
  onListingClick,
  onRemove,
  emptyMessage = 'No saved listings yet',
  className,
}: FavoritesListProps) {
  const { favorites, isLoading, error, removeFavorite } = useFavorites(filters);

  const handleRemove = async (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    await removeFavorite(listingId);
    onRemove?.(listingId);
  };

  if (isLoading) {
    return (
      <div className={cn(
        variant === 'grid' 
          ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          : 'space-y-4',
        className
      )}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-100 h-48" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        <p className="text-red-600">Failed to load favorites</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 p-8 text-center', className)}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            onClick={() => onListingClick?.(favorite)}
            className={cn(
              'flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4',
              onListingClick && 'cursor-pointer hover:border-gray-300 hover:shadow-sm'
            )}
          >
            {/* Image */}
            {favorite.listing?.featuredImage ? (
              <img
                src={favorite.listing.featuredImage}
                alt={favorite.listing.title}
                className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {favorite.listing?.title || 'Untitled'}
              </h3>
              {favorite.listing?.location && (
                <p className="text-sm text-gray-500">
                  {[favorite.listing.location.city, favorite.listing.location.region]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {favorite.listing?.price && (
                <p className="mt-1 font-medium text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: favorite.listing.currency || 'USD',
                  }).format(favorite.listing.price)}
                </p>
              )}
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => handleRemove(e, favorite.listingId)}
              className="flex-shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
              aria-label="Remove from favorites"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  }

  // Grid variant
  return (
    <div className={cn(
      'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
      className
    )}>
      {favorites.map((favorite) => (
        <div
          key={favorite.id}
          onClick={() => onListingClick?.(favorite)}
          className={cn(
            'group relative overflow-hidden rounded-lg border border-gray-200 bg-white',
            onListingClick && 'cursor-pointer hover:border-gray-300 hover:shadow-md'
          )}
        >
          {/* Image */}
          <div className="aspect-[4/3] relative">
            {favorite.listing?.featuredImage ? (
              <img
                src={favorite.listing.featuredImage}
                alt={favorite.listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Remove button */}
            <button
              onClick={(e) => handleRemove(e, favorite.listingId)}
              className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-500 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
              aria-label="Remove from favorites"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-medium text-gray-900 truncate">
              {favorite.listing?.title || 'Untitled'}
            </h3>
            {favorite.listing?.location && (
              <p className="text-sm text-gray-500">
                {[favorite.listing.location.city, favorite.listing.location.region]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {favorite.listing?.price && (
              <p className="mt-2 font-medium text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: favorite.listing.currency || 'USD',
                }).format(favorite.listing.price)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
