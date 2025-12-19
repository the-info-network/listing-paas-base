'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Subscription } from '../types';

interface UseSubscriptionResult {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  cancel: () => Promise<void>;
  resume: () => Promise<void>;
  refetch: () => Promise<void>;
}

interface UseSubscriptionsResult {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSubscription(subscriptionId: string | null): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!subscriptionId) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/subscriptions/${subscriptionId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscription(mapSubscriptionFromApi(data.subscription));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const cancel = useCallback(async () => {
    if (!subscriptionId) return;
    const response = await fetch(`/api/payments/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to cancel subscription');
    await fetchSubscription();
  }, [subscriptionId, fetchSubscription]);

  const resume = useCallback(async () => {
    if (!subscriptionId) return;
    const response = await fetch(`/api/payments/subscriptions/${subscriptionId}/resume`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to resume subscription');
    await fetchSubscription();
  }, [subscriptionId, fetchSubscription]);

  return { subscription, isLoading, error, cancel, resume, refetch: fetchSubscription };
}

export function useSubscriptions(): UseSubscriptionsResult {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      const data = await response.json();
      setSubscriptions((data.subscriptions || []).map(mapSubscriptionFromApi));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return { subscriptions, isLoading, error, refetch: fetchSubscriptions };
}

function mapSubscriptionFromApi(data: Record<string, unknown>): Subscription {
  return {
    id: data.id as string,
    customerId: data.customer_id as string,
    priceId: data.price_id as string,
    status: data.status as Subscription['status'],
    currentPeriodStart: data.current_period_start as string,
    currentPeriodEnd: data.current_period_end as string,
    cancelAtPeriodEnd: data.cancel_at_period_end as boolean,
    canceledAt: data.canceled_at as string | undefined,
    price: data.price as Subscription['price'],
    createdAt: data.created_at as string,
  };
}
