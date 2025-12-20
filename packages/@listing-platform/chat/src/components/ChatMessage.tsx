'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { ChatMessage as ChatMessageType } from '../types';

export interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={cn('flex gap-2', message.isOwn && 'flex-row-reverse')}>
      {!message.isOwn && (
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-sm">
          {message.senderAvatar ? <img src={message.senderAvatar} alt="" className="h-full w-full rounded-full object-cover" /> : message.senderName[0]}
        </div>
      )}
      <div className={cn('max-w-[70%]', message.isOwn ? 'text-right' : '')}>
        {!message.isOwn && <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>}
        <div className={cn('inline-block rounded-lg px-3 py-2 text-sm', message.isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900')}>
          {message.content}
        </div>
        <p className="text-xs text-gray-400 mt-1">{formatTime(message.createdAt)}</p>
      </div>
    </div>
  );
}
