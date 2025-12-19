'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { Deal } from '../types';

export interface DealCardProps {
  deal: Deal;
  variant?: 'default' | 'compact';
  onClick?: () => void;
  onEdit?: (deal: Deal) => void;
  className?: string;
}

export function DealCard({
  deal,
  variant = 'default',
  onClick,
  onEdit,
  className,
}: DealCardProps) {
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'deal-card rounded-lg border border-gray-200 bg-white p-3 shadow-sm',
          onClick && 'cursor-pointer hover:border-gray-300 hover:shadow',
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-gray-900">{deal.name}</p>
            {deal.contact && (
              <p className="truncate text-sm text-gray-500">
                {deal.contact.firstName} {deal.contact.lastName}
              </p>
            )}
          </div>
          <p className="ml-2 font-medium text-gray-900">
            {formatCurrency(deal.value, deal.currency)}
          </p>
        </div>

        {deal.expectedCloseDate && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(deal.expectedCloseDate)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('deal-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{deal.name}</h3>
          {deal.company && (
            <p className="text-sm text-gray-500">{deal.company.name}</p>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(deal.value, deal.currency)}
          </p>
          {deal.probability !== undefined && (
            <p className="text-xs text-gray-500">{deal.probability}% probability</p>
          )}
        </div>
      </div>

      {/* Stage badge */}
      {deal.stage && (
        <div className="mt-3">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: deal.stage.color ? `${deal.stage.color}20` : '#E5E7EB',
              color: deal.stage.color || '#374151',
            }}
          >
            {deal.stage.name}
          </span>
        </div>
      )}

      {/* Contact and dates */}
      <div className="mt-3 space-y-2 text-sm">
        {deal.contact && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {deal.contact.firstName} {deal.contact.lastName}
          </div>
        )}
        
        {deal.expectedCloseDate && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Expected close: {formatDate(deal.expectedCloseDate)}
          </div>
        )}
      </div>

      {/* Tags */}
      {deal.tags && deal.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {deal.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {onEdit && (
        <div className="mt-4 flex justify-end border-t pt-3">
          <button
            onClick={() => onEdit(deal)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Edit Deal
          </button>
        </div>
      )}
    </div>
  );
}
