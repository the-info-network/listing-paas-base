'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseToggleFavoriteResult {
  toggle: (listingId: string) => Promise<boolean>;
  isToggling: boolean;
  error: Error | null;
}

interface UseIsFavoritedResult {
  isFavorited: boolean;
  isLoading: boolean;
  toggle: () => Promise<void>;
}

export function useToggleFavorite(): UseToggleFavoriteResult {
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggle = useCallback(async (listingId: string): Promise<boolean> => {
    setIsToggling(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorites/${listingId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await response.json();
      return data.isFavorited;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsToggling(false);
    }
  }, []);

  return {
    toggle,
    isToggling,
    error,
  };
}

export function useIsFavorited(listingId: string | null): UseIsFavoritedResult {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toggle: toggleFavorite, isToggling } = useToggleFavorite();

  useEffect(() => {
    if (!listingId) {
      setIsFavorited(false);
      setIsLoading(false);
      return;
    }

    const checkFavorited = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/favorites/${listingId}/check`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      } catch {
        // Assume not favorited on error
        setIsFavorited(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavorited();
  }, [listingId]);

  const toggle = useCallback(async () => {
    if (!listingId) return;
    
    const newState = await toggleFavorite(listingId);
    setIsFavorited(newState);
  }, [listingId, toggleFavorite]);

  return {
    isFavorited,
    isLoading: isLoading || isToggling,
    toggle,
  };
}
