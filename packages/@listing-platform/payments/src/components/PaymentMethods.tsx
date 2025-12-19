'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import type { PaymentMethod } from '../types';

export interface PaymentMethodsProps {
  onMethodSelect?: (method: PaymentMethod) => void;
  className?: string;
}

export function PaymentMethods({ onMethodSelect, className }: PaymentMethodsProps) {
  const { methods, isLoading, removeMethod, setDefault } = usePaymentMethods();

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className={cn('rounded-lg border-2 border-dashed border-gray-200 p-6 text-center', className)}>
        <p className="text-gray-500">No payment methods saved</p>
      </div>
    );
  }

  const cardBrandIcons: Record<string, string> = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    default: '💳',
  };

  return (
    <div className={cn('space-y-3', className)}>
      {methods.map((method) => (
        <div
          key={method.id}
          onClick={() => onMethodSelect?.(method)}
          className={cn(
            'flex items-center justify-between rounded-lg border p-4',
            method.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
            onMethodSelect && 'cursor-pointer hover:border-gray-300'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {method.card ? cardBrandIcons[method.card.brand.toLowerCase()] || cardBrandIcons.default : '💳'}
            </span>
            <div>
              {method.card && (
                <>
                  <p className="font-medium">
                    {method.card.brand} •••• {method.card.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {method.card.expMonth}/{method.card.expYear}
                  </p>
                </>
              )}
            </div>
            {method.isDefault && (
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Default</span>
            )}
          </div>

          <div className="flex gap-2">
            {!method.isDefault && (
              <button
                onClick={(e) => { e.stopPropagation(); setDefault(method.id); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Set default
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); removeMethod(method.id); }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
