'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
  className?: string;
}

export function ForgotPasswordForm({ onSuccess, onBack, className }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={cn('text-center', className)}>
        <div className="text-4xl mb-2">📧</div>
        <p>Check your email for a password reset link.</p>
        {onBack && <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Back to login</button>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <p className="text-sm text-gray-600">Enter your email and we'll send you a reset link.</p>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" className="block w-full rounded-md border border-gray-300 px-3 py-2" />
      <button type="submit" disabled={isLoading} className={cn('w-full rounded-md bg-blue-600 px-4 py-2 text-white', isLoading ? 'opacity-50' : 'hover:bg-blue-700')}>
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </button>
      {onBack && <button type="button" onClick={onBack} className="w-full text-sm text-gray-600 hover:underline">Back to login</button>}
    </form>
  );
}
