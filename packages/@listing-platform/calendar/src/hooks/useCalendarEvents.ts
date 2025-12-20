'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '../types';

interface UseCalendarEventsResult {
  events: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCalendarEvents(startDate: string, endDate: string): UseCalendarEventsResult {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`/api/calendar/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>) => {
    const response = await fetch('/api/calendar/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event) });
    if (!response.ok) throw new Error('Failed to add event');
    const data = await response.json();
    setEvents(prev => [...prev, data.event]);
    return data.event;
  }, []);

  const updateEvent = useCallback(async (id: string, event: Partial<CalendarEvent>) => {
    await fetch(`/api/calendar/events/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event) });
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...event } : e));
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' });
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  return { events, isLoading, error, addEvent, updateEvent, deleteEvent, refetch: fetchEvents };
}
