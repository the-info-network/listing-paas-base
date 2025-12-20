'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useVerificationStatus } from '../hooks/useVerificationStatus';
import type { VerificationType } from '../types';

export interface VerificationStatusProps {
  userId?: string;
  types?: VerificationType[];
  onVerify?: (type: VerificationType) => void;
  className?: string;
}

const typeLabels: Record<VerificationType, string> = { identity: 'Identity', business: 'Business', phone: 'Phone', email: 'Email', social: 'Social', background: 'Background', license: 'License' };
const statusIcons: Record<string, string> = { verified: '✅', pending: '⏳', processing: '🔄', rejected: '❌', expired: '⚠️' };
const statusColors: Record<string, string> = { verified: 'text-green-600', pending: 'text-yellow-600', processing: 'text-blue-600', rejected: 'text-red-600', expired: 'text-orange-600' };

export function VerificationStatus({ userId, types = ['identity', 'email', 'phone'], onVerify, className }: VerificationStatusProps) {
  const { verifications, isLoading, getVerification } = useVerificationStatus(userId);

  if (isLoading) {
    return <div className={cn('space-y-2', className)}>{types.map(t => <div key={t} className="h-12 animate-pulse rounded bg-gray-100" />)}</div>;
  }

  return (
    <div className={cn('divide-y rounded-lg border border-gray-200', className)}>
      {types.map(type => {
        const verification = getVerification(type);
        const status = verification?.status;
        return (
          <div key={type} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <span className={cn('text-lg', status ? statusColors[status] : 'text-gray-400')}>{status ? statusIcons[status] : '○'}</span>
              <span className="font-medium">{typeLabels[type]}</span>
            </div>
            {!verification || verification.status === 'rejected' || verification.status === 'expired' ? (
              <button onClick={() => onVerify?.(type)} className="text-sm text-blue-600 hover:underline">Verify</button>
            ) : (
              <span className={cn('text-sm capitalize', statusColors[status || ''])}>{status}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
