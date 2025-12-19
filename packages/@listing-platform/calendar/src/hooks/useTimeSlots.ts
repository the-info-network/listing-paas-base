'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TimeSlot } from '../types';

interface UseTimeSlotsResult {
  slots: TimeSlot[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useTimeSlots(date: string, resourceId?: string): UseTimeSlotsResult {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (resourceId) params.set('resourceId', resourceId);
      const response = await fetch(`/api/calendar/slots?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [date, resourceId]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  return { slots, isLoading, refetch: fetchSlots };
}
