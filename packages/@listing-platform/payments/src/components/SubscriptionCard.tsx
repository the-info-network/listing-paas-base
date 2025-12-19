'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useSubscription } from '../hooks/useSubscription';

export interface SubscriptionCardProps {
  subscriptionId: string;
  onCancel?: () => void;
  className?: string;
}

export function SubscriptionCard({ subscriptionId, onCancel, className }: SubscriptionCardProps) {
  const { subscription, isLoading, cancel, resume } = useSubscription(subscriptionId);

  if (isLoading) {
    return <div className={cn('h-32 animate-pulse rounded-lg bg-gray-100', className)} />;
  }

  if (!subscription) {
    return <div className={cn('rounded-lg border border-gray-200 p-4 text-center text-gray-500', className)}>No subscription found</div>;
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    canceled: 'bg-red-100 text-red-800',
    trialing: 'bg-blue-100 text-blue-800',
    paused: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
  const formatPrice = (amount: number, currency: string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);

  const handleCancel = async () => {
    await cancel();
    onCancel?.();
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', statusColors[subscription.status] || 'bg-gray-100')}>
            {subscription.status.replace('_', ' ')}
          </span>
          <p className="mt-2 text-lg font-semibold">
            {formatPrice(subscription.price.unitAmount, subscription.price.currency)}
            <span className="text-sm font-normal text-gray-500">/{subscription.price.interval}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Current period: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}</p>
        {subscription.cancelAtPeriodEnd && (
          <p className="mt-1 text-yellow-600">Cancels at end of period</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {subscription.cancelAtPeriodEnd ? (
          <button onClick={resume} className="text-sm text-blue-600 hover:underline">Resume subscription</button>
        ) : subscription.status === 'active' ? (
          <button onClick={handleCancel} className="text-sm text-red-600 hover:underline">Cancel subscription</button>
        ) : null}
      </div>
    </div>
  );
}
