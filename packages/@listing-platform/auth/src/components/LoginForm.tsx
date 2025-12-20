'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

export interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, onForgotPassword, onSignup, className }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn({ email, password });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={isLoading} className={cn('w-full rounded-md bg-blue-600 px-4 py-2 text-white', isLoading ? 'opacity-50' : 'hover:bg-blue-700')}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      <div className="flex justify-between text-sm">
        {onForgotPassword && <button type="button" onClick={onForgotPassword} className="text-blue-600 hover:underline">Forgot password?</button>}
        {onSignup && <button type="button" onClick={onSignup} className="text-blue-600 hover:underline">Create account</button>}
      </div>
    </form>
  );
}
