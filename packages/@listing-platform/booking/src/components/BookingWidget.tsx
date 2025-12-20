'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '../utils/cn';
import { useAvailability } from '../hooks/useAvailability';
import { useBooking } from '../hooks/useBooking';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { BookingForm } from './BookingForm';
import type { BookingFormData, BookingPricing } from '../types';

export interface BookingWidgetProps {
  listingId: string;
  variant?: 'default' | 'compact';
  onBookingComplete?: (bookingId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

type Step = 'dates' | 'details' | 'confirmation';

export function BookingWidget({
  listingId,
  variant = 'default',
  onBookingComplete,
  onError,
  className,
}: BookingWidgetProps) {
  const [step, setStep] = useState<Step>('dates');
  const [selectedDates, setSelectedDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [pricing, setPricing] = useState<BookingPricing | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 2);

  const { calendarDays, isLoading: isLoadingAvailability } = useAvailability(listingId, {
    startDate: today.toISOString().split('T')[0],
    endDate: nextMonth.toISOString().split('T')[0],
  });

  const { createBooking, calculatePricing, isSubmitting, error } = useBooking();

  const handleDateSelect = useCallback(async (startDate: string, endDate: string) => {
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
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Failed to calculate pricing'));
    }
  }, [listingId, calculatePricing, onError]);

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
      
      setBookingId(booking.id);
      setStep('confirmation');
      onBookingComplete?.(booking.id);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Failed to create booking'));
    }
  }, [listingId, createBooking, onBookingComplete, onError]);

  const handleBack = useCallback(() => {
    if (step === 'details') {
      setStep('dates');
    }
  }, [step]);

  return (
    <div
      className={cn(
        'booking-widget rounded-lg border border-gray-200 bg-white shadow-sm',
        variant === 'compact' && 'p-4',
        variant === 'default' && 'p-6',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {step === 'dates' && 'Select Dates'}
          {step === 'details' && 'Booking Details'}
          {step === 'confirmation' && 'Booking Confirmed!'}
        </h3>
        
        {/* Step indicator */}
        <div className="mt-2 flex items-center gap-2">
          {(['dates', 'details', 'confirmation'] as Step[]).map((s, idx) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  step === s ? 'bg-blue-600' : 'bg-gray-300'
                )}
              />
              {idx < 2 && <div className="h-0.5 w-8 bg-gray-300" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      {step === 'dates' && (
        <div>
          <AvailabilityCalendar
            listingId={listingId}
            days={calendarDays}
            isLoading={isLoadingAvailability}
            onDateRangeSelect={handleDateSelect}
          />
        </div>
      )}

      {step === 'details' && selectedDates && (
        <div>
          <button
            onClick={handleBack}
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            ← Change dates
          </button>
          
          <BookingForm
            listingId={listingId}
            startDate={selectedDates.startDate}
            endDate={selectedDates.endDate}
            pricing={pricing}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            onCancel={handleBack}
          />
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error.message}</p>
          )}
        </div>
      )}

      {step === 'confirmation' && bookingId && (
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-600">
            Your booking has been confirmed. Check your email for details.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Booking ID: {bookingId}
          </p>
        </div>
      )}
    </div>
  );
}
