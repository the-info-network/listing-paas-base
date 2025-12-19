'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import type { OAuthProvider } from '../types';

export interface OAuthButtonsProps {
  providers?: OAuthProvider[];
  className?: string;
}

const providerConfig: Record<OAuthProvider, { label: string; icon: string; bg: string }> = {
  google: { label: 'Google', icon: 'G', bg: 'bg-white border text-gray-700 hover:bg-gray-50' },
  github: { label: 'GitHub', icon: '⚫', bg: 'bg-gray-900 text-white hover:bg-gray-800' },
  facebook: { label: 'Facebook', icon: 'f', bg: 'bg-blue-600 text-white hover:bg-blue-700' },
  twitter: { label: 'Twitter', icon: '𝕏', bg: 'bg-black text-white hover:bg-gray-900' },
  apple: { label: 'Apple', icon: '', bg: 'bg-black text-white hover:bg-gray-900' },
  linkedin: { label: 'LinkedIn', icon: 'in', bg: 'bg-blue-700 text-white hover:bg-blue-800' },
};

export function OAuthButtons({ providers = ['google', 'github'], className }: OAuthButtonsProps) {
  const { signInWithOAuth } = useAuth();

  return (
    <div className={cn('space-y-2', className)}>
      {providers.map(provider => {
        const config = providerConfig[provider];
        return (
          <button key={provider} onClick={() => signInWithOAuth(provider)} className={cn('flex w-full items-center justify-center gap-2 rounded-md px-4 py-2', config.bg)}>
            <span>{config.icon}</span>
            <span>Continue with {config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
