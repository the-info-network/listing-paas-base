'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Booking, BookingFilters } from '../types';

interface UseBookingsResult {
  bookings: Booking[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch user's bookings
 */
export function useBookings(filters?: BookingFilters): UseBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        statuses.forEach(s => params.append('status', s));
      }
      if (filters?.paymentStatus) {
        const paymentStatuses = Array.isArray(filters.paymentStatus) 
          ? filters.paymentStatus 
          : [filters.paymentStatus];
        paymentStatuses.forEach(s => params.append('paymentStatus', s));
      }
      if (filters?.startDate) params.set('startDate', filters.startDate);
      if (filters?.endDate) params.set('endDate', filters.endDate);
      if (filters?.listingId) params.set('listingId', filters.listingId);
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/bookings?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings?.map(mapBookingFromApi) || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [
    filters?.status,
    filters?.paymentStatus,
    filters?.startDate,
    filters?.endDate,
    filters?.listingId,
    filters?.sortBy,
    filters?.sortOrder,
    filters?.limit,
    filters?.offset,
  ]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    total,
    isLoading,
    error,
    refetch: fetchBookings,
  };
}

/**
 * Map API response to Booking type
 */
function mapBookingFromApi(data: Record<string, unknown>): Booking {
  return {
    id: data.id as string,
    listingId: data.listing_id as string,
    userId: data.user_id as string,
    tenantId: data.tenant_id as string,
    startDate: data.start_date as string,
    endDate: data.end_date as string,
    startTime: data.start_time as string | undefined,
    endTime: data.end_time as string | undefined,
    guestCount: data.guest_count as number,
    guestDetails: data.guest_details as Booking['guestDetails'],
    basePrice: data.base_price as number,
    serviceFee: data.service_fee as number,
    taxAmount: data.tax_amount as number,
    discountAmount: data.discount_amount as number,
    totalAmount: data.total_amount as number,
    currency: data.currency as string,
    paymentStatus: data.payment_status as Booking['paymentStatus'],
    paymentIntentId: data.payment_intent_id as string | undefined,
    paymentMethod: data.payment_method as string | undefined,
    paidAt: data.paid_at as string | undefined,
    status: data.status as Booking['status'],
    confirmationCode: data.confirmation_code as string,
    cancelledAt: data.cancelled_at as string | undefined,
    cancelledBy: data.cancelled_by as string | undefined,
    cancellationReason: data.cancellation_reason as string | undefined,
    refundAmount: data.refund_amount as number | undefined,
    specialRequests: data.special_requests as string | undefined,
    internalNotes: data.internal_notes as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
