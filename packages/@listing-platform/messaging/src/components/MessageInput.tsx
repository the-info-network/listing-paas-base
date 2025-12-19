'use client';

import React, { useState, useRef } from 'react';
import { cn } from '../utils/cn';
import { useSendMessage } from '../hooks/useSendMessage';

export interface MessageInputProps {
  conversationId: string;
  onSend?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function MessageInput({
  conversationId,
  onSend,
  placeholder = 'Type a message...',
  className,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { send, isSending } = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContent = content.trim();
    if (!trimmedContent && files.length === 0) return;

    try {
      await send(conversationId, { 
        content: trimmedContent,
        attachments: files.length > 0 ? files : undefined,
      });
      setContent('');
      setFiles([]);
      onSend?.(trimmedContent);
    } catch {
      // Error handled by hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('border-t bg-white p-3', className)}>
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          style={{ maxHeight: '150px' }}
        />
        
        <button
          type="submit"
          disabled={isSending || (!content.trim() && files.length === 0)}
          className={cn(
            'flex-shrink-0 rounded-full bg-blue-600 p-2 text-white',
            isSending || (!content.trim() && files.length === 0)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700'
          )}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  );
}
