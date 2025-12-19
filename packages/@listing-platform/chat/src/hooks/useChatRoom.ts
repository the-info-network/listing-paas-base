'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat } from './useChat';
import type { ChatMessage } from '../types';

interface UseChatRoomResult {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  typingUsers: string[];
  loadMore: () => Promise<void>;
}

export function useChatRoom(roomId: string): UseChatRoomResult {
  const { subscribe, sendMessage: send, setTyping: setTypingStatus, typingUsers: allTyping } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } finally { setIsLoading(false); }
    };
    fetchHistory();

    return subscribe(roomId, (msg) => setMessages(prev => [...prev, msg]));
  }, [roomId, subscribe]);

  const sendMessage = useCallback(async (content: string) => {
    await send(roomId, content);
  }, [roomId, send]);

  const setTyping = useCallback((isTyping: boolean) => {
    setTypingStatus(roomId, isTyping);
  }, [roomId, setTypingStatus]);

  const loadMore = useCallback(async () => {
    const oldest = messages[0]?.createdAt;
    if (!oldest) return;
    const response = await fetch(`/api/chat/rooms/${roomId}/messages?before=${oldest}`);
    if (response.ok) {
      const data = await response.json();
      setMessages(prev => [...(data.messages || []), ...prev]);
    }
  }, [roomId, messages]);

  const typingUsers = (allTyping.get(roomId) || []).map(t => t.userName);

  return { messages, isLoading, sendMessage, setTyping, typingUsers, loadMore };
}
