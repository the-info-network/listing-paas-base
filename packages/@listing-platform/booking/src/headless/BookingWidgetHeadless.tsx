'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import { useAvailability } from '../hooks/useAvailability';
import { useBooking } from '../hooks/useBooking';
import type { BookingFormData, BookingPricing, BookingCalendarDay, Booking } from '../types';

type Step = 'dates' | 'details' | 'confirmation';

export interface BookingWidgetHeadlessProps {
  listingId: string;
  renderCalendar: (props: CalendarRenderProps) => ReactNode;
  renderForm: (props: FormRenderProps) => ReactNode;
  renderConfirmation?: (props: ConfirmationRenderProps) => ReactNode;
  renderLoading?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
  onBookingComplete?: (bookingId: string) => void;
}

export interface CalendarRenderProps {
  days: BookingCalendarDay[];
  isLoading: boolean;
  selectedDates: { startDate: string; endDate: string } | null;
  onDateRangeSelect: (startDate: string, endDate: string) => void;
  onDateSelect: (date: string) => void;
}

export interface FormRenderProps {
  startDate: string;
  endDate: string;
  pricing: BookingPricing | null;
  isSubmitting: boolean;
  error: Error | null;
  onSubmit: (data: BookingFormData) => void;
  onBack: () => void;
}

export interface ConfirmationRenderProps {
  booking: Booking | null;
  bookingId: string;
}

export function BookingWidgetHeadless({
  listingId,
  renderCalendar,
  renderForm,
  renderConfirmation,
  renderLoading,
  renderError,
  onBookingComplete,
}: BookingWidgetHeadlessProps) {
  const [step, setStep] = useState<Step>('dates');
  const [selectedDates, setSelectedDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [pricing, setPricing] = useState<BookingPricing | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 2);

  const { calendarDays, isLoading: isLoadingAvailability, error: availabilityError } = useAvailability(listingId, {
    startDate: today.toISOString().split('T')[0],
    endDate: nextMonth.toISOString().split('T')[0],
  });

  const { createBooking, calculatePricing, isSubmitting, error: bookingError } = useBooking();

  const handleDateSelect = useCallback((date: string) => {
    // Single date selection - set as start date
    setSelectedDates({ startDate: date, endDate: date });
  }, []);

  const handleDateRangeSelect = useCallback(async (startDate: string, endDate: string) => {
    setSelectedDates({ startDate, endDate });
    
    try {
      const pricingResult = await calculatePricing({
        listingId,
        startDate,
        endDate,
        guestCount: 1,
      });
      setPricing(pricingResult);
      setStep('details');
    } catch {
      // Error is already set in the hook
    }
  }, [listingId, calculatePricing]);

  const handleFormSubmit = useCallback(async (formData: BookingFormData) => {
    try {
      const booking = await createBooking({
        listingId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        guestCount: formData.guestCount,
        guestDetails: formData.guestDetails,
        specialRequests: formData.specialRequests,
      });
      
      setCompletedBooking(booking);
      setBookingId(booking.id);
      setStep('confirmation');
      onBookingComplete?.(booking.id);
    } catch {
      // Error is already set in the hook
    }
  }, [listingId, createBooking, onBookingComplete]);

  const handleBack = useCallback(() => {
    if (step === 'details') {
      setStep('dates');
    }
  }, [step]);

  // Handle error states
  const error = availabilityError || bookingError;
  if (error && renderError) {
    return <>{renderError(error)}</>;
  }

  // Handle loading state for initial load
  if (isLoadingAvailability && step === 'dates' && renderLoading) {
    return <>{renderLoading()}</>;
  }

  // Render based on current step
  if (step === 'dates') {
    return (
      <>
        {renderCalendar({
          days: calendarDays,
          isLoading: isLoadingAvailability,
          selectedDates,
          onDateRangeSelect: handleDateRangeSelect,
          onDateSelect: handleDateSelect,
        })}
      </>
    );
  }

  if (step === 'details' && selectedDates) {
    return (
      <>
        {renderForm({
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate,
          pricing,
          isSubmitting,
          error: bookingError,
          onSubmit: handleFormSubmit,
          onBack: handleBack,
        })}
      </>
    );
  }

  if (step === 'confirmation' && bookingId) {
    if (renderConfirmation) {
      return (
        <>
          {renderConfirmation({
            booking: completedBooking,
            bookingId,
          })}
        </>
      );
    }
    
    // Default confirmation
    return (
      <div>
        <p>Booking confirmed! ID: {bookingId}</p>
      </div>
    );
  }

  return null;
}
