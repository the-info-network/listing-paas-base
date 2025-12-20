'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, ConversationFilters } from '../types';

interface UseConversationsResult {
  conversations: Conversation[];
  unreadTotal: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useConversations(filters?: ConversationFilters): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.listingId) params.set('listingId', filters.listingId);
      if (filters?.unreadOnly) params.set('unreadOnly', 'true');
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/conversations?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      const mapped = (data.data || []).map(mapConversationFromApi);
      setConversations(mapped);
      setUnreadTotal(mapped.reduce((sum: number, c: Conversation) => sum + c.unreadCount, 0));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.listingId, filters?.unreadOnly, filters?.limit, filters?.offset]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, unreadTotal, isLoading, error, refetch: fetchConversations };
}

function mapConversationFromApi(data: Record<string, unknown>): Conversation {
  return {
    id: data.id as string,
    participants: (data.participants as Record<string, unknown>[])?.map(p => ({
      id: p.id as string,
      userId: p.user_id as string,
      name: p.name as string,
      avatarUrl: p.avatar_url as string | undefined,
      isOnline: p.is_online as boolean | undefined,
      lastSeenAt: p.last_seen_at as string | undefined,
    })) || [],
    listingId: data.listing_id as string | undefined,
    unreadCount: (data.unread_count as number) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
