'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AvailabilitySlot, AvailabilityFilters, BookingCalendarDay } from '../types';

interface UseAvailabilityResult {
  slots: AvailabilitySlot[];
  calendarDays: BookingCalendarDay[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch availability slots for a listing
 */
export function useAvailability(
  listingId: string,
  filters: Omit<AvailabilityFilters, 'listingId'>
): UseAvailabilityResult {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [calendarDays, setCalendarDays] = useState<BookingCalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!listingId || !filters.startDate || !filters.endDate) {
      setSlots([]);
      setCalendarDays([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        listingId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.availableOnly !== undefined && { availableOnly: String(filters.availableOnly) }),
      });

      const response = await fetch(`/api/availability?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      setSlots(data.slots || []);
      
      // Generate calendar days from slots
      const days = generateCalendarDays(
        filters.startDate,
        filters.endDate,
        data.slots || []
      );
      setCalendarDays(days);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [listingId, filters.startDate, filters.endDate, filters.availableOnly]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    slots,
    calendarDays,
    isLoading,
    error,
    refetch: fetchAvailability,
  };
}

/**
 * Generate calendar days from availability slots
 */
function generateCalendarDays(
  startDate: string,
  endDate: string,
  slots: AvailabilitySlot[]
): BookingCalendarDay[] {
  const days: BookingCalendarDay[] = [];
  const slotMap = new Map(slots.map(s => [s.date, s]));
  
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const slot = slotMap.get(dateStr);
    
    let status: BookingCalendarDay['status'] = 'unavailable';
    if (slot) {
      if (!slot.available) {
        status = 'unavailable';
      } else if (slot.currentBookings >= slot.maxBookings) {
        status = 'booked';
      } else if (slot.currentBookings > 0) {
        status = 'partial';
      } else {
        status = 'available';
      }
    }
    
    days.push({
      date: dateStr,
      available: slot?.available ?? false,
      price: slot?.price,
      status,
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}
