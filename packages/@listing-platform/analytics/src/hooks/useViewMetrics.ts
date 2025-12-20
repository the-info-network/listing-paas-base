'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ViewMetrics, TimeRange } from '../types';

interface UseViewMetricsOptions {
  timeRange?: TimeRange;
}

interface UseViewMetricsResult {
  metrics: ViewMetrics[];
  totalViews: number;
  totalImpressions: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useViewMetrics(
  listingId: string | null,
  options: UseViewMetricsOptions = {}
): UseViewMetricsResult {
  const [metrics, setMetrics] = useState<ViewMetrics[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalImpressions, setTotalImpressions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { timeRange = '30d' } = options;

  const fetchMetrics = useCallback(async () => {
    if (!listingId) {
      setMetrics([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ timeRange });
      const response = await fetch(`/api/analytics/listings/${listingId}/views?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch view metrics');

      const data = await response.json();
      const mapped = (data.metrics || []).map((m: Record<string, unknown>) => ({
        date: m.date as string,
        views: m.views as number,
        uniqueViews: m.unique_views as number,
        impressions: m.impressions as number,
      }));
      
      setMetrics(mapped);
      setTotalViews(data.total_views || 0);
      setTotalImpressions(data.total_impressions || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [listingId, timeRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, totalViews, totalImpressions, isLoading, error, refetch: fetchMetrics };
}
