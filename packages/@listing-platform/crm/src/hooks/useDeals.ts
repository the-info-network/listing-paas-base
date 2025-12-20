'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Deal, DealFilters, PipelineStage, CreateDealInput } from '../types';

interface UseDealsResult {
  deals: Deal[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createDeal: (input: CreateDealInput) => Promise<Deal>;
  updateDeal: (id: string, input: Partial<CreateDealInput>) => Promise<Deal>;
  moveDeal: (id: string, stageId: string) => Promise<Deal>;
  deleteDeal: (id: string) => Promise<void>;
}

interface UseDealResult {
  deal: Deal | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UsePipelineResult {
  stages: PipelineStage[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  moveDeal: (dealId: string, stageId: string) => Promise<void>;
}

/**
 * Hook to fetch and manage deals
 */
export function useDeals(filters?: DealFilters): UseDealsResult {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.set('search', filters.search);
      if (filters?.stageId) params.set('stageId', filters.stageId);
      if (filters?.contactId) params.set('contactId', filters.contactId);
      if (filters?.companyId) params.set('companyId', filters.companyId);
      if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo);
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/deals?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const data = await response.json();
      setDeals(data.data?.map(mapDealFromApi) || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.stageId, filters?.contactId, filters?.companyId, filters?.assignedTo, filters?.sortBy, filters?.sortOrder, filters?.limit, filters?.offset]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const createDeal = useCallback(async (input: CreateDealInput): Promise<Deal> => {
    const response = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapDealToApi(input)),
    });

    if (!response.ok) {
      throw new Error('Failed to create deal');
    }

    const data = await response.json();
    const deal = mapDealFromApi(data.data);
    setDeals(prev => [deal, ...prev]);
    setTotal(prev => prev + 1);
    return deal;
  }, []);

  const updateDeal = useCallback(async (id: string, input: Partial<CreateDealInput>): Promise<Deal> => {
    const response = await fetch(`/api/deals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapDealToApi(input)),
    });

    if (!response.ok) {
      throw new Error('Failed to update deal');
    }

    const data = await response.json();
    const deal = mapDealFromApi(data.data);
    setDeals(prev => prev.map(d => d.id === id ? deal : d));
    return deal;
  }, []);

  const moveDeal = useCallback(async (id: string, stageId: string): Promise<Deal> => {
    return updateDeal(id, { stageId });
  }, [updateDeal]);

  const deleteDeal = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/deals/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete deal');
    }

    setDeals(prev => prev.filter(d => d.id !== id));
    setTotal(prev => prev - 1);
  }, []);

  return {
    deals,
    total,
    isLoading,
    error,
    refetch: fetchDeals,
    createDeal,
    updateDeal,
    moveDeal,
    deleteDeal,
  };
}

/**
 * Hook to fetch a single deal
 */
export function useDeal(id: string | null): UseDealResult {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeal = useCallback(async () => {
    if (!id) {
      setDeal(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deals/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch deal');
      }

      const data = await response.json();
      setDeal(mapDealFromApi(data.data));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  return {
    deal,
    isLoading,
    error,
    refetch: fetchDeal,
  };
}

/**
 * Hook to fetch pipeline (stages with deals)
 */
export function usePipeline(): UsePipelineResult {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPipeline = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/deals/pipeline');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pipeline');
      }

      const data = await response.json();
      const pipelineStages: PipelineStage[] = (data.data || []).map((stage: Record<string, unknown>) => ({
        ...mapStageFromApi(stage),
        deals: ((stage.deals || []) as Record<string, unknown>[]).map(mapDealFromApi),
      }));
      
      setStages(pipelineStages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const moveDeal = useCallback(async (dealId: string, stageId: string): Promise<void> => {
    const response = await fetch(`/api/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId }),
    });

    if (!response.ok) {
      throw new Error('Failed to move deal');
    }

    // Update local state
    setStages(prev => {
      const deal = prev.flatMap(s => s.deals).find(d => d.id === dealId);
      if (!deal) return prev;

      return prev.map(stage => ({
        ...stage,
        deals: stage.id === stageId
          ? [...stage.deals, { ...deal, stageId }]
          : stage.deals.filter(d => d.id !== dealId),
      }));
    });
  }, []);

  return {
    stages,
    isLoading,
    error,
    refetch: fetchPipeline,
    moveDeal,
  };
}

function mapDealFromApi(data: Record<string, unknown>): Deal {
  return {
    id: data.id as string,
    tenantId: data.tenant_id as string,
    name: data.name as string,
    stageId: data.stage_id as string,
    contactId: data.contact_id as string | undefined,
    companyId: data.company_id as string | undefined,
    value: data.value as number,
    currency: (data.currency as string) || 'USD',
    probability: data.probability as number | undefined,
    expectedCloseDate: data.expected_close_date as string | undefined,
    description: data.description as string | undefined,
    tags: data.tags as string[] | undefined,
    assignedTo: data.assigned_to as string | undefined,
    customFields: data.custom_fields as Record<string, unknown> | undefined,
    createdBy: data.created_by as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function mapStageFromApi(data: Record<string, unknown>): Omit<PipelineStage, 'deals'> {
  return {
    id: data.id as string,
    tenantId: data.tenant_id as string,
    name: data.name as string,
    position: data.position as number,
    probability: (data.probability as number) || 0,
    color: data.color as string | undefined,
    isWon: data.is_won as boolean | undefined,
    isLost: data.is_lost as boolean | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function mapDealToApi(input: Partial<CreateDealInput>): Record<string, unknown> {
  return {
    name: input.name,
    stage_id: input.stageId,
    contact_id: input.contactId,
    company_id: input.companyId,
    value: input.value,
    currency: input.currency,
    probability: input.probability,
    expected_close_date: input.expectedCloseDate,
    description: input.description,
    tags: input.tags,
    assigned_to: input.assignedTo,
    custom_fields: input.customFields,
  };
}
