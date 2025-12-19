'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '../utils/cn';
import type { BookingCalendarDay } from '../types';

export interface AvailabilityCalendarProps {
  listingId: string;
  days?: BookingCalendarDay[];
  isLoading?: boolean;
  onDateSelect?: (date: string) => void;
  onDateRangeSelect?: (startDate: string, endDate: string) => void;
  className?: string;
}

export function AvailabilityCalendar({
  days = [],
  isLoading = false,
  onDateSelect,
  onDateRangeSelect,
  className,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const daysMap = useMemo(() => {
    return new Map(days.map(d => [d.date, d]));
  }, [days]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const result: (Date | null)[] = [];
    
    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      result.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      result.push(new Date(year, month, day));
    }
    
    return result;
  }, [currentMonth]);

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayInfo = daysMap.get(dateStr);
    
    if (!dayInfo?.available) return;

    if (onDateSelect) {
      onDateSelect(dateStr);
      return;
    }

    if (onDateRangeSelect) {
      if (!selectedStart || (selectedStart && selectedEnd)) {
        setSelectedStart(dateStr);
        setSelectedEnd(null);
      } else if (dateStr < selectedStart) {
        setSelectedStart(dateStr);
        setSelectedEnd(null);
      } else {
        setSelectedEnd(dateStr);
        onDateRangeSelect(selectedStart, dateStr);
      }
    }
  };

  const isInRange = (dateStr: string) => {
    if (!selectedStart) return false;
    const end = selectedEnd || hoveredDate;
    if (!end) return false;
    return dateStr >= selectedStart && dateStr <= end;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-64 rounded-lg bg-gray-200" />
      </div>
    );
  }

  return (
    <div className={cn('availability-calendar', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded p-1 hover:bg-gray-100"
          aria-label="Previous month"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h4 className="font-medium text-gray-900">{monthYear}</h4>
        <button
          onClick={nextMonth}
          className="rounded p-1 hover:bg-gray-100"
          aria-label="Next month"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week days header */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        {weekDays.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const dateStr = date.toISOString().split('T')[0];
          const dayInfo = daysMap.get(dateStr);
          const isAvailable = dayInfo?.available ?? false;
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          const isSelected = dateStr === selectedStart || dateStr === selectedEnd;
          const inRange = isInRange(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={!isAvailable || isPast}
              className={cn(
                'relative flex h-10 items-center justify-center rounded text-sm transition-colors',
                isAvailable && !isPast && 'hover:bg-blue-50',
                !isAvailable && 'cursor-not-allowed text-gray-300',
                isPast && 'cursor-not-allowed text-gray-300',
                isSelected && 'bg-blue-600 text-white hover:bg-blue-700',
                inRange && !isSelected && 'bg-blue-100',
                dayInfo?.status === 'booked' && 'bg-red-50 text-red-400',
                dayInfo?.status === 'partial' && 'bg-yellow-50'
              )}
            >
              {date.getDate()}
              {dayInfo?.price && isAvailable && !isPast && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-gray-500">
                  ${dayInfo.price}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-blue-600" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gray-200" />
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-red-50 border border-red-200" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
