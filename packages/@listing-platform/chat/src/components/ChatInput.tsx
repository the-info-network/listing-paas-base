'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

export interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  className?: string;
}

export function ChatInput({ onSend, onTyping, className }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); };
  }, []);

  const handleChange = (value: string) => {
    setMessage(value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 1000);
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    onTyping(false);
    try {
      await onSend(message.trim());
      setMessage('');
    } finally { setIsSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className={cn('flex gap-2 border-t p-3', className)}>
      <input
        type="text"
        value={message}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button onClick={handleSend} disabled={!message.trim() || isSending} className={cn('rounded-md bg-blue-600 px-4 py-2 text-sm text-white', (!message.trim() || isSending) ? 'opacity-50' : 'hover:bg-blue-700')}>
        Send
      </button>
    </div>
  );
}
