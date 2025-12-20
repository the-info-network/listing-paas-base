'use client';

import { useState, useCallback } from 'react';
import type { VerificationType, VerificationResult } from '../types';

interface UseVerificationResult {
  startVerification: (type: VerificationType, data?: Record<string, string>) => Promise<VerificationResult>;
  uploadDocument: (type: VerificationType, file: File) => Promise<void>;
  isSubmitting: boolean;
  error: Error | null;
}

export function useVerification(): UseVerificationResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startVerification = useCallback(async (type: VerificationType, data?: Record<string, string>): Promise<VerificationResult> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/verification/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, data }) });
      if (!response.ok) throw new Error('Verification failed to start');
      return await response.json();
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Unknown error');
      setError(e);
      return { success: false, error: e.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const uploadDocument = useCallback(async (type: VerificationType, file: File) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const response = await fetch('/api/verification/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { startVerification, uploadDocument, isSubmitting, error };
}
