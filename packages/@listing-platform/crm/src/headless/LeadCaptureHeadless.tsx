'use client';

import React, { useState, ReactNode } from 'react';
import { useLeadCapture } from '../hooks/useLeadCapture';
import type { LeadFormData } from '../types';

export interface LeadCaptureHeadlessProps {
  listingId?: string;
  source?: string;
  renderField: (props: FieldRenderProps) => ReactNode;
  renderSubmit: (props: SubmitRenderProps) => ReactNode;
  renderSuccess?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
  onSubmit?: (contactId: string) => void;
}

export interface FieldRenderProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  label: string;
  required: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export interface SubmitRenderProps {
  isSubmitting: boolean;
  onClick: () => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export function LeadCaptureHeadless({
  listingId,
  source = 'website',
  renderField,
  renderSubmit,
  renderSuccess,
  renderError,
  onSubmit,
}: LeadCaptureHeadlessProps) {
  const [formState, setFormState] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { submitLead, isSubmitting, success, error } = useLeadCapture();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formState.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const data: LeadFormData = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        phone: formState.phone || undefined,
        message: formState.message || undefined,
        source,
        listingId,
      };

      const contact = await submitLead(data);
      onSubmit?.(contact.id);
    } catch {
      // Error handled by hook
    }
  };

  const updateField = (field: keyof FormState) => (value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (success && renderSuccess) {
    return <>{renderSuccess()}</>;
  }

  if (error && renderError) {
    return <>{renderError(error)}</>;
  }

  const fields: Array<{
    id: keyof FormState;
    type: FieldRenderProps['type'];
    label: string;
    required: boolean;
  }> = [
    { id: 'firstName', type: 'text', label: 'First Name', required: true },
    { id: 'lastName', type: 'text', label: 'Last Name', required: true },
    { id: 'email', type: 'email', label: 'Email', required: true },
    { id: 'phone', type: 'tel', label: 'Phone', required: false },
    { id: 'message', type: 'textarea', label: 'Message', required: false },
  ];

  return (
    <>
      {fields.map((field) =>
        renderField({
          id: field.id,
          name: field.id,
          type: field.type,
          label: field.label,
          required: field.required,
          value: formState[field.id],
          onChange: updateField(field.id),
          error: errors[field.id],
        })
      )}
      {renderSubmit({
        isSubmitting,
        onClick: handleSubmit,
      })}
    </>
  );
}
