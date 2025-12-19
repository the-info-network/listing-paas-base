'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PaymentMethod } from '../types';

interface UsePaymentMethodsResult {
  methods: PaymentMethod[];
  isLoading: boolean;
  error: Error | null;
  addMethod: (paymentMethodId: string) => Promise<PaymentMethod>;
  removeMethod: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePaymentMethods(): UsePaymentMethodsResult {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');

      const data = await response.json();
      setMethods(data.methods?.map(mapMethodFromApi) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const addMethod = useCallback(async (paymentMethodId: string): Promise<PaymentMethod> => {
    const response = await fetch('/api/payments/methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId }),
    });

    if (!response.ok) throw new Error('Failed to add payment method');

    const data = await response.json();
    const method = mapMethodFromApi(data.method);
    setMethods(prev => [...prev, method]);
    return method;
  }, []);

  const removeMethod = useCallback(async (id: string) => {
    const response = await fetch(`/api/payments/methods/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to remove payment method');
    setMethods(prev => prev.filter(m => m.id !== id));
  }, []);

  const setDefault = useCallback(async (id: string) => {
    const response = await fetch(`/api/payments/methods/${id}/default`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to set default');
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
  }, []);

  return { methods, isLoading, error, addMethod, removeMethod, setDefault, refetch: fetchMethods };
}

function mapMethodFromApi(data: Record<string, unknown>): PaymentMethod {
  return {
    id: data.id as string,
    type: data.type as PaymentMethod['type'],
    card: data.card as PaymentMethod['card'],
    isDefault: data.is_default as boolean,
    createdAt: data.created_at as string,
  };
}
