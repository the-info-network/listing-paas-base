'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Message, MessageFilters } from '../types';

interface UseMessagesResult {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useMessages(conversationId: string | null, filters?: MessageFilters): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const limit = filters?.limit || 50;

  const fetchMessages = useCallback(async (append = false, before?: string) => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (before) params.set('before', before);

      const response = await fetch(`/api/conversations/${conversationId}/messages?${params}`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      const newMessages = (data.data || []).map(mapMessageFromApi);

      if (append) {
        setMessages(prev => [...prev, ...newMessages]);
      } else {
        setMessages(newMessages);
      }
      setHasMore(newMessages.length >= limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, limit]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || messages.length === 0) return;
    const oldestMessage = messages[messages.length - 1];
    await fetchMessages(true, oldestMessage.createdAt);
  }, [fetchMessages, hasMore, isLoading, messages]);

  return { messages, isLoading, error, hasMore, loadMore, refetch: () => fetchMessages() };
}

function mapMessageFromApi(data: Record<string, unknown>): Message {
  return {
    id: data.id as string,
    conversationId: data.conversation_id as string,
    senderId: data.sender_id as string,
    senderName: data.sender_name as string,
    senderAvatar: data.sender_avatar as string | undefined,
    content: data.content as string,
    attachments: data.attachments as Message['attachments'],
    isRead: data.is_read as boolean,
    readAt: data.read_at as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
