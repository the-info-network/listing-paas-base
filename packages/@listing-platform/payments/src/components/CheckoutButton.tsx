'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useCheckout } from '../hooks/useCheckout';

export interface CheckoutButtonProps {
  priceId: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
  label?: string;
  className?: string;
}

export function CheckoutButton({
  priceId,
  quantity = 1,
  successUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/success`,
  cancelUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/cancel`,
  label = 'Subscribe',
  className,
}: CheckoutButtonProps) {
  const { createCheckout, redirectToCheckout, isLoading, error } = useCheckout();

  const handleClick = async () => {
    try {
      const session = await createCheckout({
        priceId,
        quantity,
        successUrl,
        cancelUrl,
      });
      await redirectToCheckout(session.id);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors',
          isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-700',
          className
        )}
      >
        {isLoading ? 'Loading...' : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
