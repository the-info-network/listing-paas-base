'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Contact, ContactFilters, CreateContactInput } from '../types';

interface UseContactsResult {
  contacts: Contact[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createContact: (input: CreateContactInput) => Promise<Contact>;
  updateContact: (id: string, input: Partial<CreateContactInput>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
}

interface UseContactResult {
  contact: Contact | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage contacts
 */
export function useContacts(filters?: ContactFilters): UseContactsResult {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.set('search', filters.search);
      if (filters?.companyId) params.set('companyId', filters.companyId);
      if (filters?.tags) filters.tags.forEach(t => params.append('tags', t));
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/contacts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.data?.map(mapContactFromApi) || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.companyId, filters?.tags, filters?.sortBy, filters?.sortOrder, filters?.limit, filters?.offset]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = useCallback(async (input: CreateContactInput): Promise<Contact> => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapContactToApi(input)),
    });

    if (!response.ok) {
      throw new Error('Failed to create contact');
    }

    const data = await response.json();
    const contact = mapContactFromApi(data.data);
    setContacts(prev => [contact, ...prev]);
    setTotal(prev => prev + 1);
    return contact;
  }, []);

  const updateContact = useCallback(async (id: string, input: Partial<CreateContactInput>): Promise<Contact> => {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapContactToApi(input)),
    });

    if (!response.ok) {
      throw new Error('Failed to update contact');
    }

    const data = await response.json();
    const contact = mapContactFromApi(data.data);
    setContacts(prev => prev.map(c => c.id === id ? contact : c));
    return contact;
  }, []);

  const deleteContact = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete contact');
    }

    setContacts(prev => prev.filter(c => c.id !== id));
    setTotal(prev => prev - 1);
  }, []);

  return {
    contacts,
    total,
    isLoading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}

/**
 * Hook to fetch a single contact
 */
export function useContact(id: string | null): UseContactResult {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContact = useCallback(async () => {
    if (!id) {
      setContact(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contacts/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact');
      }

      const data = await response.json();
      setContact(mapContactFromApi(data.data));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return {
    contact,
    isLoading,
    error,
    refetch: fetchContact,
  };
}

function mapContactFromApi(data: Record<string, unknown>): Contact {
  return {
    id: data.id as string,
    tenantId: data.tenant_id as string,
    companyId: data.company_id as string | undefined,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    email: data.email as string | undefined,
    phone: data.phone as string | undefined,
    mobile: data.mobile as string | undefined,
    jobTitle: data.job_title as string | undefined,
    department: data.department as string | undefined,
    address: data.address as Contact['address'],
    avatarUrl: data.avatar_url as string | undefined,
    tags: data.tags as string[] | undefined,
    customFields: data.custom_fields as Record<string, unknown> | undefined,
    notes: data.notes as string | undefined,
    createdBy: data.created_by as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    company: data.company ? mapCompanyFromApi(data.company as Record<string, unknown>) : undefined,
  };
}

function mapCompanyFromApi(data: Record<string, unknown>): Contact['company'] {
  return {
    id: data.id as string,
    tenantId: data.tenant_id as string,
    name: data.name as string,
    website: data.website as string | undefined,
    industry: data.industry as string | undefined,
    size: data.size as Contact['company'] extends { size: infer S } ? S : undefined,
    annualRevenue: data.annual_revenue as number | undefined,
    description: data.description as string | undefined,
    address: data.address as Contact['address'],
    phone: data.phone as string | undefined,
    email: data.email as string | undefined,
    logoUrl: data.logo_url as string | undefined,
    tags: data.tags as string[] | undefined,
    customFields: data.custom_fields as Record<string, unknown> | undefined,
    createdBy: data.created_by as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function mapContactToApi(input: Partial<CreateContactInput>): Record<string, unknown> {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    mobile: input.mobile,
    company_id: input.companyId,
    job_title: input.jobTitle,
    department: input.department,
    address: input.address,
    tags: input.tags,
    notes: input.notes,
    custom_fields: input.customFields,
  };
}
