'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Activity, ActivityFilters, EntityType } from '../types';

interface UseActivitiesResult {
  activities: Activity[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

/**
 * Hook to fetch activities for an entity
 */
export function useActivities(
  entityId: string | null,
  entityType: EntityType,
  filters?: ActivityFilters
): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const limit = filters?.limit || 20;

  const fetchActivities = useCallback(async (append = false) => {
    if (!entityId) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        entityId,
        entityType,
        limit: String(limit),
        offset: String(append ? offset : 0),
      });

      if (filters?.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        types.forEach(t => params.append('type', t));
      }
      if (filters?.startDate) params.set('startDate', filters.startDate);
      if (filters?.endDate) params.set('endDate', filters.endDate);

      const response = await fetch(`/api/activities?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      const newActivities = (data.data || []).map(mapActivityFromApi);
      
      if (append) {
        setActivities(prev => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
      }
      
      setHasMore(newActivities.length >= limit);
      if (append) {
        setOffset(prev => prev + newActivities.length);
      } else {
        setOffset(newActivities.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [entityId, entityType, limit, offset, filters?.type, filters?.startDate, filters?.endDate]);

  useEffect(() => {
    setOffset(0);
    fetchActivities(false);
  }, [entityId, entityType, filters?.type, filters?.startDate, filters?.endDate]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchActivities(true);
  }, [fetchActivities, hasMore, isLoading]);

  return {
    activities,
    isLoading,
    error,
    refetch: () => fetchActivities(false),
    hasMore,
    loadMore,
  };
}

function mapActivityFromApi(data: Record<string, unknown>): Activity {
  return {
    id: data.id as string,
    tenantId: data.tenant_id as string,
    type: data.type as Activity['type'],
    entityType: data.entity_type as Activity['entityType'],
    entityId: data.entity_id as string,
    entityName: data.entity_name as string | undefined,
    description: data.description as string,
    metadata: data.metadata as Record<string, unknown> | undefined,
    userId: data.user_id as string | undefined,
    userName: data.user_name as string | undefined,
    createdAt: data.created_at as string,
  };
}
