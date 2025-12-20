'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { Contact } from '../types';

export interface ContactCardProps {
  contact: Contact;
  variant?: 'default' | 'compact';
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onClick?: (contact: Contact) => void;
  className?: string;
}

export function ContactCard({
  contact,
  variant = 'default',
  onEdit,
  onDelete,
  onClick,
  className,
}: ContactCardProps) {
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'contact-card flex items-center gap-3 rounded-lg border border-gray-200 p-3',
          onClick && 'cursor-pointer hover:border-gray-300 hover:bg-gray-50',
          className
        )}
        onClick={() => onClick?.(contact)}
      >
        {/* Avatar */}
        {contact.avatarUrl ? (
          <img
            src={contact.avatarUrl}
            alt={fullName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-gray-900">{fullName}</p>
          {contact.email && (
            <p className="truncate text-sm text-gray-500">{contact.email}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('contact-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {contact.avatarUrl ? (
          <img
            src={contact.avatarUrl}
            alt={fullName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-medium text-blue-600">
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{fullName}</h3>
          {contact.jobTitle && (
            <p className="text-sm text-gray-600">{contact.jobTitle}</p>
          )}
          {contact.company && (
            <p className="text-sm text-gray-500">{contact.company.name}</p>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(contact)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(contact)}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contact details */}
      <div className="mt-4 space-y-2 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
              {contact.phone}
            </a>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
