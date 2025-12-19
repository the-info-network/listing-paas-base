'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useIsFavorited } from '../hooks/useToggleFavorite';

export interface FavoriteButtonProps {
  listingId: string;
  variant?: 'default' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
}

export function FavoriteButton({
  listingId,
  variant = 'default',
  size = 'md',
  onToggle,
  className,
}: FavoriteButtonProps) {
  const { isFavorited, isLoading, toggle } = useIsFavorited(listingId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await toggle();
    onToggle?.(!isFavorited);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'favorite-button inline-flex items-center justify-center rounded-full transition-all',
          sizeClasses[size],
          isFavorited 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-400 hover:text-gray-600',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <HeartIcon 
          filled={isFavorited} 
          className={cn(iconSizes[size], isLoading && 'animate-pulse')} 
        />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'favorite-button inline-flex items-center gap-2 text-sm font-medium transition-colors',
          isFavorited 
            ? 'text-red-600 hover:text-red-700' 
            : 'text-gray-600 hover:text-gray-800',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <HeartIcon filled={isFavorited} className="h-4 w-4" />
        {isFavorited ? 'Saved' : 'Save'}
      </button>
    );
  }

  // Default variant with background
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'favorite-button inline-flex items-center justify-center rounded-full bg-white shadow-md transition-all',
        sizeClasses[size],
        isFavorited 
          ? 'text-red-500 hover:bg-red-50' 
          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <HeartIcon 
        filled={isFavorited} 
        className={cn(iconSizes[size], isLoading && 'animate-pulse')} 
      />
    </button>
  );
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  if (filled) {
    return (
      <svg 
        className={className} 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }

  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5} 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
      />
    </svg>
  );
}
