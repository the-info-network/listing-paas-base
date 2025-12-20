'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { Booking } from '../types';

export interface BookingCardProps {
  booking: Booking;
  variant?: 'default' | 'compact';
  onCancel?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  className?: string;
}

export function BookingCard({
  booking,
  variant = 'default',
  onCancel,
  onViewDetails,
  className,
}: BookingCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
      case 'processing':
        return 'text-yellow-600';
      case 'failed':
      case 'refunded':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  if (variant === 'compact') {
    return (
      <div className={cn('booking-card rounded-lg border border-gray-200 p-3', className)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
            </p>
            <p className="text-xs text-gray-500">
              {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
            </p>
          </div>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(booking.status))}>
            {booking.status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('booking-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm', className)}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(booking.status))}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
          <p className="mt-1 text-xs text-gray-500">
            Confirmation: <span className="font-mono">{booking.confirmationCode}</span>
          </p>
        </div>
        <p className="text-lg font-semibold text-gray-900">
          ${booking.totalAmount}
          <span className="text-xs font-normal text-gray-500"> {booking.currency}</span>
        </p>
      </div>

      {/* Dates */}
      <div className="mb-3 flex items-center gap-4 rounded-lg bg-gray-50 p-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500">Check-in</p>
          <p className="font-medium text-gray-900">{formatDate(booking.startDate)}</p>
          {booking.startTime && <p className="text-xs text-gray-500">{booking.startTime}</p>}
        </div>
        <div className="text-gray-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <div className="flex-1 text-right">
          <p className="text-xs text-gray-500">Check-out</p>
          <p className="font-medium text-gray-900">{formatDate(booking.endDate)}</p>
          {booking.endTime && <p className="text-xs text-gray-500">{booking.endTime}</p>}
        </div>
      </div>

      {/* Details */}
      <div className="mb-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Guests</span>
          <span>{booking.guestCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment</span>
          <span className={getPaymentStatusColor(booking.paymentStatus)}>
            {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
          </span>
        </div>
        {booking.specialRequests && (
          <div className="pt-2">
            <p className="text-xs text-gray-500">Special Requests</p>
            <p className="text-gray-700">{booking.specialRequests}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {(onViewDetails || (onCancel && canCancel)) && (
        <div className="flex gap-2 border-t pt-3">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(booking.id)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Details
            </button>
          )}
          {onCancel && canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-1 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Cancel Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
}
