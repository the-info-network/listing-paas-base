'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SavedSearch, CreateSavedSearchInput } from '../types';

interface UseSavedSearchesResult {
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createSavedSearch: (input: CreateSavedSearchInput) => Promise<SavedSearch>;
  deleteSavedSearch: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export function useSavedSearches(): UseSavedSearchesResult {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSavedSearches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/saved-searches');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved searches');
      }

      const data = await response.json();
      setSavedSearches(data.data?.map(mapSavedSearchFromApi) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  const createSavedSearch = useCallback(async (input: CreateSavedSearchInput): Promise<SavedSearch> => {
    const response = await fetch('/api/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        search_params: input.searchParams,
        notification_frequency: input.notificationFrequency || 'daily',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create saved search');
    }

    const data = await response.json();
    const savedSearch = mapSavedSearchFromApi(data.data);
    setSavedSearches(prev => [savedSearch, ...prev]);
    return savedSearch;
  }, []);

  const deleteSavedSearch = useCallback(async (id: string) => {
    const response = await fetch(`/api/saved-searches/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete saved search');
    }

    setSavedSearches(prev => prev.filter(s => s.id !== id));
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    const search = savedSearches.find(s => s.id === id);
    if (!search) return;

    const response = await fetch(`/api/saved-searches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !search.isActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update saved search');
    }

    setSavedSearches(prev => prev.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  }, [savedSearches]);

  return {
    savedSearches,
    isLoading,
    error,
    refetch: fetchSavedSearches,
    createSavedSearch,
    deleteSavedSearch,
    toggleActive,
  };
}

function mapSavedSearchFromApi(data: Record<string, unknown>): SavedSearch {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    name: data.name as string,
    searchParams: data.search_params as SavedSearch['searchParams'],
    notificationFrequency: data.notification_frequency as SavedSearch['notificationFrequency'],
    isActive: data.is_active as boolean,
    lastNotifiedAt: data.last_notified_at as string | undefined,
    newResultsCount: (data.new_results_count as number) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
