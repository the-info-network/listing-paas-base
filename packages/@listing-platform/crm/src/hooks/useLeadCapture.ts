'use client';

import { useState, useCallback } from 'react';
import type { LeadFormData, Contact } from '../types';

interface UseLeadCaptureResult {
  submitLead: (data: LeadFormData) => Promise<Contact>;
  isSubmitting: boolean;
  error: Error | null;
  success: boolean;
  reset: () => void;
}

/**
 * Hook for capturing leads
 */
export function useLeadCapture(): UseLeadCaptureResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const submitLead = useCallback(async (data: LeadFormData): Promise<Contact> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          company_name: data.companyName,
          message: data.message,
          source: data.source,
          listing_id: data.listingId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit lead');
      }

      const result = await response.json();
      setSuccess(true);
      
      return {
        id: result.data.id,
        tenantId: result.data.tenant_id,
        firstName: result.data.first_name,
        lastName: result.data.last_name,
        email: result.data.email,
        phone: result.data.phone,
        createdAt: result.data.created_at,
        updatedAt: result.data.updated_at,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submitLead,
    isSubmitting,
    error,
    success,
    reset,
  };
}
