/**
 * Types for Calendar SDK
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  color?: string;
  description?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
  capacity?: number;
  booked?: number;
}

export interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  count?: number;
}

export type CalendarView = 'month' | 'week' | 'day';
