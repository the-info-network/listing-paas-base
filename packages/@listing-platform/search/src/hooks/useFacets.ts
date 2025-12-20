'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Facet } from '../types';

interface UseFacetsResult {
  facets: Facet[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFacets(category?: string): UseFacetsResult {
  const [facets, setFacets] = useState<Facet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFacets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);

      const response = await fetch(`/api/search/facets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch facets');

      const data = await response.json();
      setFacets(data.facets || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchFacets();
  }, [fetchFacets]);

  return { facets, isLoading, error, refetch: fetchFacets };
}
