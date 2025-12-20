'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { FacetFilter } from './FacetFilter';
import type { Facet, SearchFilters } from '../types';

export interface FilterPanelProps {
  facets: Facet[];
  selectedFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClear?: () => void;
  className?: string;
}

export function FilterPanel({
  facets,
  selectedFilters,
  onFilterChange,
  onClear,
  className,
}: FilterPanelProps) {
  const handleFacetChange = (field: string, value: unknown) => {
    onFilterChange({ ...selectedFilters, [field]: value });
  };

  const activeFilterCount = Object.values(selectedFilters).filter(
    v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div className={cn('filter-panel', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Filters</h3>
        {activeFilterCount > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Facets */}
      <div className="space-y-6">
        {facets.map((facet) => (
          <FacetFilter
            key={facet.field}
            facet={facet}
            value={selectedFilters[facet.field]}
            onChange={(value) => handleFacetChange(facet.field, value)}
          />
        ))}
      </div>
    </div>
  );
}
