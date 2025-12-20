'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Company, CompanyFilters } from '../types';

interface UseCompaniesResult {
  companies: Company[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseCompanyResult {
  company: Company | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch companies
 */
export function useCompanies(filters?: CompanyFilters): UseCompaniesResult {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.set('search', filters.search);
      if (filters?.industry) params.set('industry', filters.industry);
      if (filters?.size) params.set('size', filters.size);
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/companies?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      setCompanies(data.data?.map(mapCompanyFromApi) || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.industry, filters?.size, filters?.sortBy, filters?.sortOrder, filters?.limit, filters?.offset]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    total,
    isLoading,
    error,
    refetch: fetchCompanies,
  };
}

/**
 * Hook to fetch a single company
 */
export function useCompany(id: string | null): UseCompanyResult {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!id) {
      setCompany(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/companies/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }

      const data = await response.json();
      setCompany(mapCompanyFromApi(data.data));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    company,
    isLoading,
    error,
    refetch: fetchCompany,
  };
}

function mapCompanyFromApi(data: Record<string, unknown>): Company {
  return {
    id: data.id as string,
    tenantId: data.tenant_id as string,
    name: data.name as string,
    website: data.website as string | undefined,
    industry: data.industry as string | undefined,
    size: data.size as Company['size'],
    annualRevenue: data.annual_revenue as number | undefined,
    description: data.description as string | undefined,
    address: data.address as Company['address'],
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
