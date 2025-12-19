'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { TimeSlot } from '../types';

export interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId?: string;
  onSelect?: (slot: TimeSlot) => void;
  className?: string;
}

export function TimeSlotPicker({ slots, selectedSlotId, onSelect, className }: TimeSlotPickerProps) {
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (slots.length === 0) {
    return <div className={cn('py-8 text-center text-gray-500', className)}>No available slots</div>;
  }

  return (
    <div className={cn('grid gap-2 sm:grid-cols-3', className)}>
      {slots.map(slot => (
        <button
          key={slot.id}
          onClick={() => slot.available && onSelect?.(slot)}
          disabled={!slot.available}
          className={cn(
            'rounded-lg border px-4 py-2 text-sm transition-colors',
            selectedSlotId === slot.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300',
            !slot.available && 'cursor-not-allowed opacity-50'
          )}
        >
          {formatTime(slot.start)} - {formatTime(slot.end)}
        </button>
      ))}
    </div>
  );
}
