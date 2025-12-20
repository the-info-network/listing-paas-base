'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SavedListing, FavoritesFilters } from '../types';

interface UseFavoritesResult {
  favorites: SavedListing[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  removeFavorite: (listingId: string) => Promise<void>;
}

export function useFavorites(filters?: FavoritesFilters): UseFavoritesResult {
  const [favorites, setFavorites] = useState<SavedListing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.collectionId) params.set('collectionId', filters.collectionId);
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/favorites?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data.data?.map(mapSavedListingFromApi) || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.collectionId, filters?.sortBy, filters?.sortOrder, filters?.limit, filters?.offset]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (listingId: string) => {
    const response = await fetch(`/api/favorites/${listingId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove favorite');
    }

    setFavorites(prev => prev.filter(f => f.listingId !== listingId));
    setTotal(prev => prev - 1);
  }, []);

  return {
    favorites,
    total,
    isLoading,
    error,
    refetch: fetchFavorites,
    removeFavorite,
  };
}

function mapSavedListingFromApi(data: Record<string, unknown>): SavedListing {
  const listing = data.listing as Record<string, unknown> | undefined;
  
  return {
    id: data.id as string,
    userId: data.user_id as string,
    listingId: data.listing_id as string,
    collectionId: data.collection_id as string | undefined,
    notes: data.notes as string | undefined,
    createdAt: data.created_at as string,
    listing: listing ? {
      id: listing.id as string,
      title: listing.title as string,
      slug: listing.slug as string,
      featuredImage: listing.featured_image as string | undefined,
      price: listing.price as number | undefined,
      currency: listing.currency as string | undefined,
      location: listing.location as { city?: string; region?: string } | undefined,
      rating: listing.rating as number | undefined,
      reviewCount: listing.review_count as number | undefined,
    } : undefined,
  };
}
