'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useLeadCapture } from '../hooks/useLeadCapture';
import type { LeadFormData } from '../types';

export interface LeadCaptureProps {
  listingId?: string;
  source?: string;
  variant?: 'default' | 'compact' | 'inline';
  onSubmit?: (contactId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  submitLabel?: string;
  showCompanyField?: boolean;
  showMessageField?: boolean;
}

export function LeadCapture({
  listingId,
  source = 'website',
  variant = 'default',
  onSubmit,
  onError,
  className,
  submitLabel = 'Submit',
  showCompanyField = false,
  showMessageField = true,
}: LeadCaptureProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { submitLead, isSubmitting, success, error: submitError, reset } = useLeadCapture();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      const data: LeadFormData = {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        companyName: companyName || undefined,
        message: message || undefined,
        source,
        listingId,
      };

      const contact = await submitLead(data);
      onSubmit?.(contact.id);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setCompanyName('');
      setMessage('');
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Failed to submit'));
    }
  };

  const handleReset = () => {
    reset();
  };

  if (success) {
    return (
      <div className={cn('lead-capture rounded-lg border border-green-200 bg-green-50 p-6 text-center', className)}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-green-800">Thank you!</h3>
        <p className="mt-1 text-sm text-green-600">We&apos;ll be in touch soon.</p>
        <button
          onClick={handleReset}
          className="mt-4 text-sm text-green-700 underline hover:no-underline"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  const inputClasses = (field: string) => cn(
    'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1',
    errors[field]
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'lead-capture rounded-lg border border-gray-200 bg-white shadow-sm',
        variant === 'compact' && 'p-4',
        variant === 'default' && 'p-6',
        variant === 'inline' && 'p-4',
        className
      )}
    >
      <div className={cn(
        'space-y-4',
        variant === 'inline' && 'flex flex-wrap gap-4 space-y-0'
      )}>
        {/* Name fields */}
        <div className={cn(
          variant === 'inline' ? 'flex gap-2' : 'grid gap-4 sm:grid-cols-2'
        )}>
          <div className={variant === 'inline' ? 'flex-1' : ''}>
            {variant !== 'inline' && (
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
            )}
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={variant === 'inline' ? 'First name *' : undefined}
              className={inputClasses('firstName')}
            />
            {errors.firstName && variant !== 'inline' && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          
          <div className={variant === 'inline' ? 'flex-1' : ''}>
            {variant !== 'inline' && (
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
            )}
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={variant === 'inline' ? 'Last name *' : undefined}
              className={inputClasses('lastName')}
            />
            {errors.lastName && variant !== 'inline' && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className={variant === 'inline' ? 'flex-1 min-w-[200px]' : ''}>
          {variant !== 'inline' && (
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
          )}
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={variant === 'inline' ? 'Email *' : undefined}
            className={inputClasses('email')}
          />
          {errors.email && variant !== 'inline' && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        {variant !== 'inline' && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Company */}
        {showCompanyField && variant !== 'inline' && (
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company (optional)
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Message */}
        {showMessageField && variant !== 'inline' && (
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message (optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Submit error */}
        {submitError && (
          <p className="text-sm text-red-600">{submitError.message}</p>
        )}

        {/* Submit button */}
        <div className={variant === 'inline' ? '' : ''}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white',
              isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-700',
              variant === 'inline' ? '' : 'w-full'
            )}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
