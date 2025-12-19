'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { FormField } from '../types';

export interface DynamicFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}

export function DynamicField({ field, value, error, onChange }: DynamicFieldProps) {
  const baseInputClass = cn('mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1', error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500');

  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return <textarea value={String(value || '')} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} disabled={field.disabled} rows={4} className={baseInputClass} />;
      case 'select':
        return (
          <select value={String(value || '')} onChange={(e) => onChange(e.target.value)} disabled={field.disabled} className={baseInputClass}>
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(opt => <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>)}
          </select>
        );
      case 'checkbox':
        return (
          <div className="mt-2 space-y-2">
            {field.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2">
                <input type="checkbox" checked={Array.isArray(value) && value.includes(opt.value)} onChange={(e) => {
                  const arr = Array.isArray(value) ? [...value] : [];
                  if (e.target.checked) arr.push(opt.value); else arr.splice(arr.indexOf(opt.value), 1);
                  onChange(arr);
                }} className="rounded border-gray-300" />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="mt-2 space-y-2">
            {field.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2">
                <input type="radio" name={field.name} checked={value === opt.value} onChange={() => onChange(opt.value)} className="border-gray-300" />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      default:
        return <input type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : 'text'} value={String(value || '')} onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={field.placeholder} disabled={field.disabled} className={baseInputClass} />;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {field.helpText && <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
