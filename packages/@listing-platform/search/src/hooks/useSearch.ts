'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SearchFilters, SearchResult, Facet } from '../types';

interface UseSearchResult {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  facets: Facet[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSearch(filters: SearchFilters): UseSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [facets, setFacets] = useState<Facet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.query) params.set('q', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.location) params.set('location', filters.location);
      if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
      if (filters.rating !== undefined) params.set('rating', String(filters.rating));
      if (filters.amenities) filters.amenities.forEach(a => params.append('amenities', a));
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));

      const response = await fetch(`/api/search?${params}`);
      
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data.results?.map(mapResultFromApi) || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 0);
      setFacets(data.facets || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  return { results, total, page, totalPages, facets, isLoading, error, refetch: executeSearch };
}

function mapResultFromApi(data: Record<string, unknown>): SearchResult {
  return {
    id: data.id as string,
    title: data.title as string,
    slug: data.slug as string,
    description: data.description as string | undefined,
    featuredImage: data.featured_image as string | undefined,
    price: data.price as number | undefined,
    currency: data.currency as string | undefined,
    rating: data.rating as number | undefined,
    reviewCount: data.review_count as number | undefined,
    location: data.location as SearchResult['location'],
    category: data.category as string | undefined,
    highlights: data.highlights as string[] | undefined,
    createdAt: data.created_at as string,
  };
}
