'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useMessages } from '../hooks/useMessages';
import type { Message } from '../types';

export interface MessageThreadProps {
  conversationId: string;
  currentUserId?: string;
  className?: string;
}

export function MessageThread({
  conversationId,
  currentUserId,
  className,
}: MessageThreadProps) {
  const { messages, isLoading, hasMore, loadMore } = useMessages(conversationId);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className={cn('flex-1 p-4 space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn('flex gap-2', i % 2 === 0 && 'justify-end')}>
            <div className={cn(
              'max-w-[70%] rounded-lg p-3 animate-pulse',
              i % 2 === 0 ? 'bg-blue-100' : 'bg-gray-100'
            )}>
              <div className="h-4 w-32 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {hasMore && (
        <button
          onClick={loadMore}
          className="mx-auto my-2 text-sm text-blue-600 hover:underline"
        >
          Load earlier messages
        </button>
      )}
      
      <div className="flex-1 space-y-3 p-4">
        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUserId;
          const showAvatar = index === 0 || 
            messages[index - 1]?.senderId !== message.senderId;
          
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              formatTime={formatTime}
            />
          );
        })}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  formatTime,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  formatTime: (date: string) => string;
}) {
  return (
    <div className={cn('flex gap-2', isOwn && 'justify-end')}>
      {!isOwn && showAvatar && (
        message.senderAvatar ? (
          <img
            src={message.senderAvatar}
            alt={message.senderName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600">
            {message.senderName[0]}
          </div>
        )
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}
      
      <div className={cn('max-w-[70%]')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className={cn(
          'mt-1 text-xs text-gray-400',
          isOwn && 'text-right'
        )}>
          {formatTime(message.createdAt)}
          {isOwn && message.isRead && ' · Read'}
        </p>
      </div>
    </div>
  );
}
