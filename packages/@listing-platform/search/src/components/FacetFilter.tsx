'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { Facet } from '../types';

export interface FacetFilterProps {
  facet: Facet;
  value: unknown;
  onChange: (value: unknown) => void;
  className?: string;
}

export function FacetFilter({ facet, value, onChange, className }: FacetFilterProps) {
  if (facet.type === 'checkbox') {
    const selectedValues = (value as string[]) || [];

    return (
      <div className={cn('facet-filter', className)}>
        <h4 className="mb-2 text-sm font-medium text-gray-700">{facet.name}</h4>
        <div className="space-y-2">
          {facet.options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selectedValues, option.value]);
                  } else {
                    onChange(selectedValues.filter(v => v !== option.value));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{option.label}</span>
              <span className="text-xs text-gray-400">({option.count})</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (facet.type === 'radio') {
    return (
      <div className={cn('facet-filter', className)}>
        <h4 className="mb-2 text-sm font-medium text-gray-700">{facet.name}</h4>
        <div className="space-y-2">
          {facet.options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={facet.field}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{option.label}</span>
              <span className="text-xs text-gray-400">({option.count})</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (facet.type === 'select') {
    return (
      <div className={cn('facet-filter', className)}>
        <h4 className="mb-2 text-sm font-medium text-gray-700">{facet.name}</h4>
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All</option>
          {facet.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}
