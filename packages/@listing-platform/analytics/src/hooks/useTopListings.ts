'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TopListing, TimeRange } from '../types';

interface UseTopListingsOptions {
  timeRange?: TimeRange;
  limit?: number;
  sortBy?: 'views' | 'leads' | 'conversions';
}

interface UseTopListingsResult {
  listings: TopListing[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTopListings(options: UseTopListingsOptions = {}): UseTopListingsResult {
  const [listings, setListings] = useState<TopListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { timeRange = '30d', limit = 10, sortBy = 'views' } = options;

  const fetchTopListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        timeRange,
        limit: String(limit),
        sortBy,
      });
      
      const response = await fetch(`/api/analytics/listings/top?${params}`);
      if (!response.ok) throw new Error('Failed to fetch top listings');

      const data = await response.json();
      const mapped = (data.listings || []).map((l: Record<string, unknown>) => ({
        id: l.id as string,
        title: l.title as string,
        slug: l.slug as string,
        featuredImage: l.featured_image as string | undefined,
        views: l.views as number,
        leads: l.leads as number,
        conversionRate: l.conversion_rate as number,
        trend: l.trend as TopListing['trend'],
        trendPercent: l.trend_percent as number,
      }));
      
      setListings(mapped);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, limit, sortBy]);

  useEffect(() => {
    fetchTopListings();
  }, [fetchTopListings]);

  return { listings, isLoading, error, refetch: fetchTopListings };
}
