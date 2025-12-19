'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useInvoices } from '../hooks/useInvoices';

export interface InvoiceListProps {
  className?: string;
}

export function InvoiceList({ className }: InvoiceListProps) {
  const { invoices, isLoading, downloadInvoice } = useInvoices();

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />)}
      </div>
    );
  }

  if (invoices.length === 0) {
    return <div className={cn('py-8 text-center text-gray-500', className)}>No invoices yet</div>;
  }

  const statusColors: Record<string, string> = {
    paid: 'text-green-600',
    open: 'text-yellow-600',
    draft: 'text-gray-500',
    void: 'text-red-600',
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);

  return (
    <div className={cn('divide-y rounded-lg border border-gray-200', className)}>
      {invoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center justify-between p-3">
          <div>
            <p className="font-medium">{formatPrice(invoice.amount, invoice.currency)}</p>
            <p className="text-sm text-gray-500">{formatDate(invoice.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('text-sm font-medium', statusColors[invoice.status])}>
              {invoice.status}
            </span>
            {invoice.invoicePdf && (
              <button
                onClick={() => downloadInvoice(invoice.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                Download
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
