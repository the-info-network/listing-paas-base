'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LeadMetrics, TimeRange } from '../types';

interface UseLeadMetricsOptions {
  timeRange?: TimeRange;
}

interface UseLeadMetricsResult {
  metrics: LeadMetrics[];
  totalLeads: number;
  totalConversions: number;
  conversionRate: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLeadMetrics(
  listingId: string | null,
  options: UseLeadMetricsOptions = {}
): UseLeadMetricsResult {
  const [metrics, setMetrics] = useState<LeadMetrics[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
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
      const response = await fetch(`/api/analytics/listings/${listingId}/leads?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch lead metrics');

      const data = await response.json();
      const mapped = (data.metrics || []).map((m: Record<string, unknown>) => ({
        date: m.date as string,
        leads: m.leads as number,
        conversions: m.conversions as number,
        conversionRate: m.conversion_rate as number,
      }));
      
      setMetrics(mapped);
      setTotalLeads(data.total_leads || 0);
      setTotalConversions(data.total_conversions || 0);
      setConversionRate(data.conversion_rate || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [listingId, timeRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, totalLeads, totalConversions, conversionRate, isLoading, error, refetch: fetchMetrics };
}
