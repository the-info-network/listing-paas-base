'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseUnreadCountResult {
  count: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useUnreadCount(): UseUnreadCountResult {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations/unread-count');
      if (response.ok) {
        const data = await response.json();
        setCount(data.count || 0);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, isLoading, refetch: fetchCount };
}
