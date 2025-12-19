'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useDynamicForm } from '../hooks/useDynamicForm';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { DynamicField } from './DynamicField';
import type { FormSchema } from '../types';

export interface DynamicFormProps {
  schema: FormSchema;
  onSubmit?: (data: Record<string, unknown>) => void;
  className?: string;
}

export function DynamicForm({ schema, onSubmit, className }: DynamicFormProps) {
  const { values, errors, visibleFields, setValue, validate, reset } = useDynamicForm(schema);
  const { submit, isSubmitting, success } = useFormSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) {
      onSubmit(values);
    } else {
      await submit(schema.id, values);
    }
  };

  if (success) {
    return (
      <div className={cn('rounded-lg border border-green-200 bg-green-50 p-6 text-center', className)}>
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-800">{schema.successMessage || 'Form submitted successfully!'}</p>
        <button onClick={reset} className="mt-4 text-sm text-green-700 underline">Submit another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {visibleFields.map(field => (
        <DynamicField key={field.id} field={field} value={values[field.name]} error={errors[field.name]} onChange={(v) => setValue(field.name, v)} />
      ))}
      <button type="submit" disabled={isSubmitting} className={cn('w-full rounded-md bg-blue-600 px-4 py-2 text-white', isSubmitting ? 'opacity-50' : 'hover:bg-blue-700')}>
        {isSubmitting ? 'Submitting...' : schema.submitLabel || 'Submit'}
      </button>
    </form>
  );
}
