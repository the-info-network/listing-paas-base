'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage, ChatConfig, TypingIndicator } from '../types';

interface ChatContextValue {
  isConnected: boolean;
  sendMessage: (roomId: string, content: string, attachments?: File[]) => Promise<void>;
  setTyping: (roomId: string, isTyping: boolean) => void;
  subscribe: (roomId: string, callback: (message: ChatMessage) => void) => () => void;
  typingUsers: Map<string, TypingIndicator[]>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children, config }: { children: React.ReactNode; config: ChatConfig }) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator[]>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(msg: ChatMessage) => void>>>(new Map());

  useEffect(() => {
    const ws = new WebSocket(config.wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        const subs = subscribersRef.current.get(data.message.roomId);
        subs?.forEach(cb => cb(data.message));
      }
      if (data.type === 'typing') {
        setTypingUsers(prev => {
          const updated = new Map(prev);
          const room = updated.get(data.roomId) || [];
          if (data.isTyping) {
            if (!room.find(t => t.userId === data.userId)) {
              updated.set(data.roomId, [...room, { roomId: data.roomId, userId: data.userId, userName: data.userName }]);
            }
          } else {
            updated.set(data.roomId, room.filter(t => t.userId !== data.userId));
          }
          return updated;
        });
      }
    };

    return () => { ws.close(); };
  }, [config.wsUrl]);

  const sendMessage = useCallback(async (roomId: string, content: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'message', roomId, content }));
  }, []);

  const setTyping = useCallback((roomId: string, isTyping: boolean) => {
    wsRef.current?.send(JSON.stringify({ type: 'typing', roomId, isTyping }));
  }, []);

  const subscribe = useCallback((roomId: string, callback: (message: ChatMessage) => void) => {
    if (!subscribersRef.current.has(roomId)) subscribersRef.current.set(roomId, new Set());
    subscribersRef.current.get(roomId)!.add(callback);
    return () => { subscribersRef.current.get(roomId)?.delete(callback); };
  }, []);

  return (
    <ChatContext.Provider value={{ isConnected, sendMessage, setTyping, subscribe, typingUsers }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
