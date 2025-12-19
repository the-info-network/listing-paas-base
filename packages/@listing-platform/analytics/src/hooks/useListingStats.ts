'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ListingStats, TimeRange } from '../types';

interface UseListingStatsOptions {
  timeRange?: TimeRange;
}

interface UseListingStatsResult {
  stats: ListingStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useListingStats(
  listingId: string | null,
  options: UseListingStatsOptions = {}
): UseListingStatsResult {
  const [stats, setStats] = useState<ListingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { timeRange = '30d' } = options;

  const fetchStats = useCallback(async () => {
    if (!listingId) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ timeRange });
      const response = await fetch(`/api/analytics/listings/${listingId}?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats({
        listingId: data.listing_id,
        views: data.views || 0,
        uniqueViews: data.unique_views || 0,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        ctr: data.ctr || 0,
        leads: data.leads || 0,
        conversions: data.conversions || 0,
        conversionRate: data.conversion_rate || 0,
        averageTimeOnPage: data.average_time_on_page || 0,
        bounceRate: data.bounce_rate || 0,
        favorites: data.favorites || 0,
        shares: data.shares || 0,
        timeRange,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [listingId, timeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
