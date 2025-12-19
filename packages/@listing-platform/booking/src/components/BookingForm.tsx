'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import type { BookingFormData, BookingPricing, GuestDetails } from '../types';

export interface BookingFormProps {
  listingId: string;
  startDate: string;
  endDate: string;
  pricing?: BookingPricing | null;
  isSubmitting?: boolean;
  onSubmit: (data: BookingFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export function BookingForm({
  listingId,
  startDate,
  endDate,
  pricing,
  isSubmitting = false,
  onSubmit,
  onCancel,
  className,
}: BookingFormProps) {
  const [guestCount, setGuestCount] = useState(1);
  const [primaryName, setPrimaryName] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!primaryName.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!primaryEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryEmail)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const guestDetails: GuestDetails = {
      guests: [],
      primaryContact: {
        name: primaryName,
        email: primaryEmail,
        phone: primaryPhone || undefined,
      },
    };

    onSubmit({
      listingId,
      startDate,
      endDate,
      guestCount,
      guestDetails,
      specialRequests: specialRequests || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn('booking-form space-y-4', className)}>
      {/* Date summary */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Check-in</span>
            <p className="font-medium">{formatDate(startDate)}</p>
          </div>
          <div className="text-gray-300">→</div>
          <div>
            <span className="text-gray-500">Check-out</span>
            <p className="font-medium">{formatDate(endDate)}</p>
          </div>
        </div>
      </div>

      {/* Guest count */}
      <div>
        <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700">
          Number of Guests
        </label>
        <select
          id="guestCount"
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Guest' : 'Guests'}
            </option>
          ))}
        </select>
      </div>

      {/* Primary contact */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Contact Information</h4>
        
        <div>
          <label htmlFor="primaryName" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            id="primaryName"
            value={primaryName}
            onChange={(e) => setPrimaryName(e.target.value)}
            className={cn(
              'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1',
              errors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="primaryEmail" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="primaryEmail"
            value={primaryEmail}
            onChange={(e) => setPrimaryEmail(e.target.value)}
            className={cn(
              'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1',
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="primaryPhone" className="block text-sm font-medium text-gray-700">
            Phone (optional)
          </label>
          <input
            type="tel"
            id="primaryPhone"
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Special requests */}
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
          Special Requests (optional)
        </label>
        <textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Any special requirements or requests..."
        />
      </div>

      {/* Pricing summary */}
      {pricing && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h4 className="mb-2 font-medium text-gray-900">Price Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                ${pricing.basePrice} × {pricing.nights} nights
              </span>
              <span>${pricing.subtotal}</span>
            </div>
            {pricing.serviceFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee</span>
                <span>${pricing.serviceFee}</span>
              </div>
            )}
            {pricing.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span>${pricing.taxAmount}</span>
              </div>
            )}
            {pricing.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${pricing.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Total ({pricing.currency})</span>
              <span>${pricing.total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white',
            isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-700'
          )}
        >
          {isSubmitting ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}
