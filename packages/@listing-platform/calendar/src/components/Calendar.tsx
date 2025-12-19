'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '../utils/cn';
import type { CalendarEvent } from '../types';

export interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function Calendar({ events = [], onDateClick, onEventClick, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const result: (Date | null)[] = [];
    for (let i = 0; i < startPadding; i++) result.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) result.push(new Date(year, month, d));
    return result;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(e => {
      const dateKey = e.start.split('T')[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(e);
    });
    return map;
  }, [events]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white', className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded">‹</button>
        <h3 className="font-medium">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded">›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 border-b">
        {weekDays.map(d => <div key={d} className="py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="aspect-square border-b border-r" />;
          const dateStr = date.toISOString().split('T')[0];
          const dayEvents = eventsByDate.get(dateStr) || [];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          return (
            <button key={dateStr} onClick={() => onDateClick?.(dateStr)} className={cn('aspect-square border-b border-r p-1 text-left hover:bg-gray-50', isToday && 'bg-blue-50')}>
              <span className={cn('text-sm', isToday && 'font-bold text-blue-600')}>{date.getDate()}</span>
              {dayEvents.slice(0, 2).map(e => (
                <div key={e.id} onClick={(ev) => { ev.stopPropagation(); onEventClick?.(e); }} className="mt-0.5 truncate rounded px-1 text-xs" style={{ backgroundColor: e.color || '#3b82f6', color: '#fff' }}>
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
