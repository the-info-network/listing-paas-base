'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useSavedSearches } from '../hooks/useSavedSearches';
import type { SearchParams, NotificationFrequency } from '../types';

export interface SaveSearchFormProps {
  searchParams: SearchParams;
  onSave?: (alertId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function SaveSearchForm({
  searchParams,
  onSave,
  onCancel,
  className,
}: SaveSearchFormProps) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<NotificationFrequency>('daily');
  const [error, setError] = useState('');

  const { createSavedSearch } = useSavedSearches();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name for this search');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const savedSearch = await createSavedSearch({
        name: name.trim(),
        searchParams,
        notificationFrequency: frequency,
      });
      onSave?.(savedSearch.id);
    } catch {
      setError('Failed to save search. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSearchSummary = () => {
    const parts: string[] = [];
    
    if (searchParams.query) parts.push(`"${searchParams.query}"`);
    if (searchParams.location) parts.push(`in ${searchParams.location}`);
    if (searchParams.category) parts.push(searchParams.category);
    if (searchParams.minPrice || searchParams.maxPrice) {
      if (searchParams.minPrice && searchParams.maxPrice) {
        parts.push(`$${searchParams.minPrice}-$${searchParams.maxPrice}`);
      } else if (searchParams.minPrice) {
        parts.push(`$${searchParams.minPrice}+`);
      } else {
        parts.push(`up to $${searchParams.maxPrice}`);
      }
    }
    
    return parts.length > 0 ? parts.join(' · ') : 'Current search';
  };

  return (
    <form onSubmit={handleSubmit} className={cn('save-search-form space-y-4', className)}>
      {/* Search summary */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-xs text-gray-500">Saving search for:</p>
        <p className="text-sm font-medium text-gray-900">{getSearchSummary()}</p>
      </div>

      {/* Name input */}
      <div>
        <label htmlFor="searchName" className="block text-sm font-medium text-gray-700">
          Name this search
        </label>
        <input
          type="text"
          id="searchName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My dream home search"
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Notification frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email me new results
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { value: 'instant', label: 'Instantly' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'never', label: 'Never' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFrequency(option.value as NotificationFrequency)}
              className={cn(
                'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                frequency === option.value
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

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
          {isSubmitting ? 'Saving...' : 'Save Search'}
        </button>
      </div>
    </form>
  );
}
