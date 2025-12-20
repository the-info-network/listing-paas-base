'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useSendMessage } from '../hooks/useSendMessage';

export interface InquiryFormProps {
  listingId: string;
  recipientId: string;
  listingTitle?: string;
  onSend?: (conversationId: string) => void;
  className?: string;
}

export function InquiryForm({
  listingId,
  recipientId,
  listingTitle,
  onSend,
  className,
}: InquiryFormProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { createConversation, isSending } = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setError('');

    try {
      const conversationId = await createConversation({
        recipientId,
        listingId,
        initialMessage: message.trim(),
      });
      
      setSuccess(true);
      setMessage('');
      onSend?.(conversationId);
    } catch {
      setError('Failed to send message. Please try again.');
    }
  };

  if (success) {
    return (
      <div className={cn('rounded-lg border border-green-200 bg-green-50 p-6 text-center', className)}>
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-medium text-green-800">Message sent!</p>
        <p className="mt-1 text-sm text-green-600">We'll notify you when they reply.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm text-green-700 underline hover:no-underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {listingTitle && (
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Inquiring about:</p>
          <p className="text-sm font-medium text-gray-900">{listingTitle}</p>
        </div>
      )}
      
      <div>
        <label htmlFor="inquiryMessage" className="block text-sm font-medium text-gray-700">
          Your message
        </label>
        <textarea
          id="inquiryMessage"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Hi, I'm interested in this listing. Could you tell me more about..."
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
      
      <button
        type="submit"
        disabled={isSending}
        className={cn(
          'w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white',
          isSending ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-700'
        )}
      >
        {isSending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
