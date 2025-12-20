'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Collection, CreateCollectionInput } from '../types';

interface UseCollectionsResult {
  collections: Collection[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createCollection: (input: CreateCollectionInput) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
}

export function useCollections(): UseCollectionsResult {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/collections');
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      setCollections(data.data?.map(mapCollectionFromApi) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = useCallback(async (input: CreateCollectionInput): Promise<Collection> => {
    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        is_public: input.isPublic ?? false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create collection');
    }

    const data = await response.json();
    const collection = mapCollectionFromApi(data.data);
    setCollections(prev => [collection, ...prev]);
    return collection;
  }, []);

  const deleteCollection = useCallback(async (id: string) => {
    const response = await fetch(`/api/collections/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete collection');
    }

    setCollections(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    collections,
    isLoading,
    error,
    refetch: fetchCollections,
    createCollection,
    deleteCollection,
  };
}

function mapCollectionFromApi(data: Record<string, unknown>): Collection {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    isPublic: data.is_public as boolean,
    coverImage: data.cover_image as string | undefined,
    listingCount: (data.listing_count as number) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
