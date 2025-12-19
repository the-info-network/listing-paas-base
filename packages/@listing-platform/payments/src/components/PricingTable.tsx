'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { CheckoutButton } from './CheckoutButton';
import type { Product } from '../types';

export interface PricingTableProps {
  products: Product[];
  highlightedProductId?: string;
  className?: string;
}

export function PricingTable({ products, highlightedProductId, className }: PricingTableProps) {
  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount / 100);

  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
      {products.map((product) => {
        const monthlyPrice = product.prices.find(p => p.interval === 'month');
        const isHighlighted = product.id === highlightedProductId;

        return (
          <div
            key={product.id}
            className={cn(
              'relative rounded-xl border p-6',
              isHighlighted ? 'border-blue-500 shadow-lg' : 'border-gray-200'
            )}
          >
            {isHighlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs text-white">
                Most Popular
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            {product.description && (
              <p className="mt-1 text-sm text-gray-500">{product.description}</p>
            )}

            {monthlyPrice && (
              <div className="mt-4">
                <span className="text-3xl font-bold">{formatPrice(monthlyPrice.unitAmount, monthlyPrice.currency)}</span>
                <span className="text-gray-500">/{monthlyPrice.interval}</span>
              </div>
            )}

            {monthlyPrice && (
              <div className="mt-6">
                <CheckoutButton
                  priceId={monthlyPrice.id}
                  label="Get Started"
                  className={cn('w-full', isHighlighted && 'bg-blue-600')}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
