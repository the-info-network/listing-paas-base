'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useVerificationStatus } from '../hooks/useVerificationStatus';
import type { VerificationType } from '../types';

export interface VerificationBadgeProps {
  userId?: string;
  type?: VerificationType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeConfig: Record<VerificationType, { icon: string; label: string; color: string }> = {
  identity: { icon: '✓', label: 'ID Verified', color: 'bg-green-100 text-green-800' },
  business: { icon: '🏢', label: 'Business Verified', color: 'bg-blue-100 text-blue-800' },
  phone: { icon: '📱', label: 'Phone Verified', color: 'bg-gray-100 text-gray-800' },
  email: { icon: '📧', label: 'Email Verified', color: 'bg-gray-100 text-gray-800' },
  social: { icon: '🔗', label: 'Social Verified', color: 'bg-purple-100 text-purple-800' },
  background: { icon: '🛡️', label: 'Background Check', color: 'bg-indigo-100 text-indigo-800' },
  license: { icon: '📜', label: 'Licensed', color: 'bg-yellow-100 text-yellow-800' },
};

export function VerificationBadge({ userId, type, showLabel = true, size = 'md', className }: VerificationBadgeProps) {
  const { verifications, isLoading, isVerified } = useVerificationStatus(userId);

  if (isLoading) return null;

  const sizes = { sm: 'text-xs px-1.5 py-0.5', md: 'text-sm px-2 py-1', lg: 'text-base px-3 py-1.5' };

  if (type) {
    if (!isVerified(type)) return null;
    const config = badgeConfig[type];
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', config.color, sizes[size], className)}>
        <span>{config.icon}</span>
        {showLabel && <span>{config.label}</span>}
      </span>
    );
  }

  const verified = verifications.filter(v => v.status === 'verified');
  if (verified.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {verified.map(v => {
        const config = badgeConfig[v.type];
        return (
          <span key={v.id} className={cn('inline-flex items-center gap-1 rounded-full font-medium', config.color, sizes[size])}>
            <span>{config.icon}</span>
            {showLabel && <span>{config.label}</span>}
          </span>
        );
      })}
    </div>
  );
}
