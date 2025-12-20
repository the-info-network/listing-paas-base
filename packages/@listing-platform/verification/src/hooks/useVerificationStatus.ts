'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Verification, VerificationType } from '../types';

interface UseVerificationStatusResult {
  verifications: Verification[];
  isLoading: boolean;
  isVerified: (type?: VerificationType) => boolean;
  getVerification: (type: VerificationType) => Verification | undefined;
  refetch: () => Promise<void>;
}

export function useVerificationStatus(userId?: string): UseVerificationStatusResult {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = userId ? `/api/verification/status?userId=${userId}` : '/api/verification/status';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const isVerified = useCallback((type?: VerificationType): boolean => {
    if (type) return verifications.some(v => v.type === type && v.status === 'verified');
    return verifications.some(v => v.status === 'verified');
  }, [verifications]);

  const getVerification = useCallback((type: VerificationType) => 
    verifications.find(v => v.type === type), [verifications]);

  return { verifications, isLoading, isVerified, getVerification, refetch: fetchStatus };
}
