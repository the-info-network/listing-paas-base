'use client';

import { useState, useCallback } from 'react';

interface UseFormSubmitResult {
  submit: (formId: string, data: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  error: Error | null;
  success: boolean;
}

export function useFormSubmit(): UseFormSubmitResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (formId: string, data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(`/api/forms/${formId}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error('Form submission failed');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submit, isSubmitting, error, success };
}
