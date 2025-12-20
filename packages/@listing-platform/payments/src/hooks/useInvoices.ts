'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invoice } from '../types';

interface UseInvoicesResult {
  invoices: Invoice[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  downloadInvoice: (invoiceId: string) => Promise<void>;
}

export function useInvoices(): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices((data.invoices || []).map(mapInvoiceFromApi));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const downloadInvoice = useCallback(async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice?.invoicePdf) {
      window.open(invoice.invoicePdf, '_blank');
    }
  }, [invoices]);

  return { invoices, isLoading, error, refetch: fetchInvoices, downloadInvoice };
}

function mapInvoiceFromApi(data: Record<string, unknown>): Invoice {
  return {
    id: data.id as string,
    customerId: data.customer_id as string,
    subscriptionId: data.subscription_id as string | undefined,
    amount: data.amount as number,
    currency: data.currency as string,
    status: data.status as Invoice['status'],
    paidAt: data.paid_at as string | undefined,
    dueDate: data.due_date as string | undefined,
    invoicePdf: data.invoice_pdf as string | undefined,
    lineItems: data.line_items as Invoice['lineItems'],
    createdAt: data.created_at as string,
  };
}
