'use client';

import { useState, useCallback, useMemo } from 'react';
import type { FormSchema, FormField, FieldCondition } from '../types';

interface UseDynamicFormResult {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  visibleFields: FormField[];
  setValue: (name: string, value: unknown) => void;
  validate: () => boolean;
  reset: () => void;
}

export function useDynamicForm(schema: FormSchema): UseDynamicFormResult {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    schema.fields.forEach(f => { if (f.defaultValue !== undefined) initial[f.name] = f.defaultValue; });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = useCallback((name: string, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[name]; return e; });
  }, []);

  const checkCondition = useCallback((condition: FieldCondition): boolean => {
    const fieldValue = values[condition.field];
    switch (condition.operator) {
      case 'equals': return fieldValue === condition.value;
      case 'notEquals': return fieldValue !== condition.value;
      case 'isEmpty': return !fieldValue;
      case 'isNotEmpty': return !!fieldValue;
      case 'contains': return String(fieldValue || '').includes(String(condition.value));
      default: return true;
    }
  }, [values]);

  const visibleFields = useMemo(() => {
    return schema.fields.filter(field => {
      if (!field.conditions) return true;
      const showConditions = field.conditions.filter(c => c.action === 'show');
      const hideConditions = field.conditions.filter(c => c.action === 'hide');
      if (hideConditions.some(checkCondition)) return false;
      if (showConditions.length > 0 && !showConditions.some(checkCondition)) return false;
      return true;
    });
  }, [schema.fields, checkCondition]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    visibleFields.forEach(field => {
      const value = values[field.name];
      if (field.required && (value === undefined || value === '' || value === null)) {
        newErrors[field.name] = `${field.label} is required`;
      }
      field.validation?.forEach(rule => {
        if (rule.type === 'minLength' && typeof value === 'string' && value.length < (rule.value as number)) {
          newErrors[field.name] = rule.message;
        }
        if (rule.type === 'email' && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field.name] = rule.message;
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [visibleFields, values]);

  const reset = useCallback(() => {
    const initial: Record<string, unknown> = {};
    schema.fields.forEach(f => { if (f.defaultValue !== undefined) initial[f.name] = f.defaultValue; });
    setValues(initial);
    setErrors({});
  }, [schema.fields]);

  return { values, errors, visibleFields, setValue, validate, reset };
}
