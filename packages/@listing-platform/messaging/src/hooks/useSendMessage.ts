'use client';

import { useState, useCallback } from 'react';
import type { Message, SendMessageInput, CreateConversationInput } from '../types';

interface UseSendMessageResult {
  send: (conversationId: string, input: SendMessageInput) => Promise<Message>;
  createConversation: (input: CreateConversationInput) => Promise<string>;
  isSending: boolean;
  error: Error | null;
}

export function useSendMessage(): UseSendMessageResult {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(async (conversationId: string, input: SendMessageInput): Promise<Message> => {
    setIsSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('content', input.content);
      if (input.attachments) {
        input.attachments.forEach(file => formData.append('attachments', file));
      }

      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      return {
        id: data.data.id,
        conversationId: data.data.conversation_id,
        senderId: data.data.sender_id,
        senderName: data.data.sender_name,
        content: data.data.content,
        isRead: false,
        createdAt: data.data.created_at,
        updatedAt: data.data.updated_at,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, []);

  const createConversation = useCallback(async (input: CreateConversationInput): Promise<string> => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: input.recipientId,
          listing_id: input.listingId,
          initial_message: input.initialMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to create conversation');

      const data = await response.json();
      return data.data.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, []);

  return { send, createConversation, isSending, error };
}
