'use client';

import { useState, useCallback } from 'react';
import type { Booking, CreateBookingInput, CancelBookingInput, BookingPricing } from '../types';

interface UseBookingResult {
  createBooking: (input: CreateBookingInput) => Promise<Booking>;
  cancelBooking: (input: CancelBookingInput) => Promise<Booking>;
  calculatePricing: (input: Omit<CreateBookingInput, 'guestDetails' | 'specialRequests'>) => Promise<BookingPricing>;
  isSubmitting: boolean;
  error: Error | null;
}

/**
 * Hook for creating and managing bookings
 */
export function useBooking(): UseBookingResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createBooking = useCallback(async (input: CreateBookingInput): Promise<Booking> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: input.listingId,
          start_date: input.startDate,
          end_date: input.endDate,
          start_time: input.startTime,
          end_time: input.endTime,
          guest_count: input.guestCount,
          guest_details: input.guestDetails,
          special_requests: input.specialRequests,
          payment_method_id: input.paymentMethodId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const data = await response.json();
      return mapBookingFromApi(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const cancelBooking = useCallback(async (input: CancelBookingInput): Promise<Booking> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${input.bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: input.reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const data = await response.json();
      return mapBookingFromApi(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const calculatePricing = useCallback(async (
    input: Omit<CreateBookingInput, 'guestDetails' | 'specialRequests'>
  ): Promise<BookingPricing> => {
    try {
      const response = await fetch('/api/bookings/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: input.listingId,
          start_date: input.startDate,
          end_date: input.endDate,
          guest_count: input.guestCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate pricing');
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  return {
    createBooking,
    cancelBooking,
    calculatePricing,
    isSubmitting,
    error,
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
