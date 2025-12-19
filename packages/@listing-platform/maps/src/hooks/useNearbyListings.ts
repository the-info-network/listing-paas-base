'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Coordinates, NearbyListing, NearbyListingsFilters } from '../types';

interface UseNearbyListingsResult {
  listings: NearbyListing[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch nearby listings based on location
 */
export function useNearbyListings(
  location: Coordinates | null,
  filters: NearbyListingsFilters = {}
): UseNearbyListingsResult {
  const [listings, setListings] = useState<NearbyListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNearbyListings = useCallback(async () => {
    if (!location) {
      setListings([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: String(location.lat),
        lng: String(location.lng),
        radiusKm: String(filters.radiusKm || 10),
        limit: String(filters.limit || 20),
      });

      if (filters.category) {
        params.set('category', filters.category);
      }
      if (filters.minRating !== undefined) {
        params.set('minRating', String(filters.minRating));
      }

      const response = await fetch(`/api/listings/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby listings');
      }

      const data = await response.json();
      
      const mappedListings: NearbyListing[] = (data.listings || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        title: item.title as string,
        distanceKm: item.distance_km as number,
        location: {
          lat: (item.location as { lat: number; lng: number })?.lat,
          lng: (item.location as { lat: number; lng: number })?.lng,
        },
      }));
      
      setListings(mappedListings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [location?.lat, location?.lng, filters.radiusKm, filters.limit, filters.category, filters.minRating]);

  useEffect(() => {
    fetchNearbyListings();
  }, [fetchNearbyListings]);

  return {
    listings,
    isLoading,
    error,
    refetch: fetchNearbyListings,
  };
}
