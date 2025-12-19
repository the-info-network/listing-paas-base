'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import type { BookingCalendarDay } from '../types';

export interface AvailabilityCalendarHeadlessProps {
  days: BookingCalendarDay[];
  isLoading?: boolean;
  onDateSelect?: (date: string) => void;
  onDateRangeSelect?: (startDate: string, endDate: string) => void;
  renderMonth: (props: MonthRenderProps) => ReactNode;
  renderDay: (props: DayRenderProps) => ReactNode;
  renderHeader?: (props: HeaderRenderProps) => ReactNode;
  renderLoading?: () => ReactNode;
}

export interface MonthRenderProps {
  month: Date;
  days: DayRenderProps[];
  weekDays: string[];
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

export interface DayRenderProps {
  date: Date | null;
  dateString: string | null;
  dayInfo: BookingCalendarDay | null;
  isSelected: boolean;
  isInRange: boolean;
  isAvailable: boolean;
  isPast: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

export interface HeaderRenderProps {
  monthLabel: string;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

export function AvailabilityCalendarHeadless({
  days,
  isLoading = false,
  onDateSelect,
  onDateRangeSelect,
  renderMonth,
  renderDay,
  renderLoading,
}: AvailabilityCalendarHeadlessProps) {
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
    
    for (let i = 0; i < startPadding; i++) {
      result.push(null);
    }
    
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

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (isLoading && renderLoading) {
    return <>{renderLoading()}</>;
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dayRenderProps: DayRenderProps[] = calendarDays.map((date) => {
    if (!date) {
      return {
        date: null,
        dateString: null,
        dayInfo: null,
        isSelected: false,
        isInRange: false,
        isAvailable: false,
        isPast: false,
        onClick: () => {},
        onMouseEnter: () => {},
      };
    }

    const dateStr = date.toISOString().split('T')[0];
    const dayInfo = daysMap.get(dateStr) || null;
    const isAvailable = dayInfo?.available ?? false;
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const isSelected = dateStr === selectedStart || dateStr === selectedEnd;

    return {
      date,
      dateString: dateStr,
      dayInfo,
      isSelected,
      isInRange: isInRange(dateStr),
      isAvailable,
      isPast,
      onClick: () => handleDateClick(date),
      onMouseEnter: () => setHoveredDate(dateStr),
    };
  });

  return (
    <>
      {renderMonth({
        month: currentMonth,
        days: dayRenderProps,
        weekDays,
        goToPreviousMonth,
        goToNextMonth,
      })}
    </>
  );
}
