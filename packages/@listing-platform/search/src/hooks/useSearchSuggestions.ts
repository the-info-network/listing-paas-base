'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SearchSuggestion } from '../types';

interface UseSearchSuggestionsResult {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
}

export function useSearchSuggestions(query: string, debounceMs = 300): UseSearchSuggestionsResult {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs, fetchSuggestions]);

  return { suggestions, isLoading };
}
