'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '../utils/cn';
import { useChatRoom } from '../hooks/useChatRoom';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export interface ChatWidgetProps {
  roomId: string;
  className?: string;
}

export function ChatWidget({ roomId, className }: ChatWidgetProps) {
  const { messages, isLoading, sendMessage, setTyping, typingUsers } = useChatRoom(roomId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className={cn('flex h-96 flex-col rounded-lg border border-gray-200 bg-white', className)}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-400 italic">{typingUsers.join(', ')} typing...</div>
        )}
      </div>
      <ChatInput onSend={sendMessage} onTyping={setTyping} />
    </div>
  );
}
