'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskFilters } from '../types';

interface UseTasksResult {
  tasks: Task[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseTaskResult {
  task: Task | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch tasks
 */
export function useTasks(filters?: TaskFilters): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        statuses.forEach(s => params.append('status', s));
      }
      if (filters?.priority) {
        const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
        priorities.forEach(p => params.append('priority', p));
      }
      if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo);
      if (filters?.dueDate) params.set('dueDate', filters.dueDate);
      if (filters?.overdue !== undefined) params.set('overdue', String(filters.overdue));
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/tasks?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.data?.map(mapTaskFromApi) || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.priority, filters?.assignedTo, filters?.dueDate, filters?.overdue, filters?.sortBy, filters?.sortOrder, filters?.limit, filters?.offset]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    total,
    isLoading,
    error,
    refetch: fetchTasks,
  };
}

/**
 * Hook to fetch a single task
 */
export function useTask(id: string | null): UseTaskResult {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTask = useCallback(async () => {
    if (!id) {
      setTask(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }

      const data = await response.json();
      setTask(mapTaskFromApi(data.data));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    isLoading,
    error,
    refetch: fetchTask,
  };
}

function mapTaskFromApi(data: Record<string, unknown>): Task {
  return {
    id: data.id as string,
    tenantId: data.tenant_id as string,
    title: data.title as string,
    description: data.description as string | undefined,
    dueDate: data.due_date as string | undefined,
    dueTime: data.due_time as string | undefined,
    priority: (data.priority as Task['priority']) || 'medium',
    status: (data.status as Task['status']) || 'pending',
    contactId: data.contact_id as string | undefined,
    companyId: data.company_id as string | undefined,
    dealId: data.deal_id as string | undefined,
    assignedTo: data.assigned_to as string | undefined,
    createdBy: data.created_by as string | undefined,
    completedAt: data.completed_at as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
