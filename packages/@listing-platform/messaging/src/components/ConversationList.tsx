'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useConversations } from '../hooks/useConversations';
import type { Conversation } from '../types';

export interface ConversationListProps {
  onConversationClick?: (conversation: Conversation) => void;
  activeConversationId?: string;
  className?: string;
}

export function ConversationList({
  onConversationClick,
  activeConversationId,
  className,
}: ConversationListProps) {
  const { conversations, isLoading, error } = useConversations();

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-3 w-40 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className={cn('p-4 text-red-600', className)}>Failed to load conversations</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className={cn('p-8 text-center text-gray-500', className)}>
        No conversations yet
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-gray-100', className)}>
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find(p => p.userId !== 'currentUser');
        
        return (
          <button
            key={conv.id}
            onClick={() => onConversationClick?.(conv)}
            className={cn(
              'flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-gray-50',
              activeConversationId === conv.id && 'bg-blue-50'
            )}
          >
            {otherParticipant?.avatarUrl ? (
              <img
                src={otherParticipant.avatarUrl}
                alt={otherParticipant.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                {otherParticipant?.name?.[0] || '?'}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={cn('font-medium truncate', conv.unreadCount > 0 && 'text-gray-900')}>
                  {otherParticipant?.name || 'Unknown'}
                </p>
                <span className="text-xs text-gray-500">
                  {formatTime(conv.updatedAt)}
                </span>
              </div>
              
              {conv.lastMessage && (
                <p className={cn(
                  'text-sm truncate',
                  conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                )}>
                  {conv.lastMessage.content}
                </p>
              )}
              
              {conv.listing && (
                <p className="text-xs text-gray-400 truncate">
                  Re: {conv.listing.title}
                </p>
              )}
            </div>

            {conv.unreadCount > 0 && (
              <span className="flex-shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {conv.unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
