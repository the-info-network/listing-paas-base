'use client';

import { useState, useCallback } from 'react';
import type { CheckoutSession, CreateCheckoutInput } from '../types';

interface UseCheckoutResult {
  createCheckout: (input: CreateCheckoutInput) => Promise<CheckoutSession>;
  redirectToCheckout: (sessionId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useCheckout(): UseCheckoutResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCheckout = useCallback(async (input: CreateCheckoutInput): Promise<CheckoutSession> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const data = await response.json();
      return data.session;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const redirectToCheckout = useCallback(async (sessionId: string) => {
    // Dynamic import for Stripe
    const { loadStripe } = await import('@stripe/stripe-js');
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '');
    
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }
  }, []);

  return { createCheckout, redirectToCheckout, isLoading, error };
}
