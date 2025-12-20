import { Hono } from 'hono';
import { z } from 'zod';
import { getAdminClient } from '../lib/supabase';
import { success, created, noContent, errors, paginated } from '../lib/response';
import { getTenantFilter } from '../middleware/tenant';

export const tasksRoutes = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  contactId: z.string().uuid().optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
  dealId: z.string().uuid().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

const updateTaskSchema = createTaskSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedTo: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'due_date', 'priority', 'title']).default('due_date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/tasks
 * List all tasks for the tenant
 */
tasksRoutes.get('/', async (c) => {
  const query = listQuerySchema.parse(c.req.query());
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  let dbQuery = supabase
    .from('tasks')
    .select('*, contact:contacts(*), company:companies(*), deal:deals(*)', { count: 'exact' })
    .eq('tenant_id', tenant_id)
    .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
    .range((query.page - 1) * query.limit, query.page * query.limit - 1);
  
  if (query.search) {
    dbQuery = dbQuery.ilike('title', `%${query.search}%`);
  }
  
  if (query.status) {
    dbQuery = dbQuery.eq('status', query.status);
  }
  
  if (query.priority) {
    dbQuery = dbQuery.eq('priority', query.priority);
  }
  
  if (query.assignedTo) {
    dbQuery = dbQuery.eq('assigned_to', query.assignedTo);
  }
  
  if (query.contactId) {
    dbQuery = dbQuery.eq('contact_id', query.contactId);
  }
  
  if (query.companyId) {
    dbQuery = dbQuery.eq('company_id', query.companyId);
  }
  
  if (query.dealId) {
    dbQuery = dbQuery.eq('deal_id', query.dealId);
  }
  
  if (query.dueBefore) {
    dbQuery = dbQuery.lte('due_date', query.dueBefore);
  }
  
  if (query.dueAfter) {
    dbQuery = dbQuery.gte('due_date', query.dueAfter);
  }
  
  const { data, error, count } = await dbQuery;
  
  if (error) throw error;
  
  return paginated(c, data || [], query.page, query.limit, count || 0);
});

/**
 * GET /api/tasks/my
 * Get tasks assigned to the current user
 */
tasksRoutes.get('/my', async (c) => {
  const { tenant_id } = getTenantFilter(c);
  const user = c.get('user');
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*, contact:contacts(*), company:companies(*), deal:deals(*)')
    .eq('tenant_id', tenant_id)
    .eq('assigned_to', user.id)
    .neq('status', 'completed')
    .neq('status', 'cancelled')
    .order('due_date', { ascending: true });
  
  if (error) throw error;
  
  return success(c, data || []);
});

/**
 * GET /api/tasks/:id
 * Get a single task
 */
tasksRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*, contact:contacts(*), company:companies(*), deal:deals(*)')
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Task');
    }
    throw error;
  }
  
  return success(c, data);
});

/**
 * POST /api/tasks
 * Create a new task
 */
tasksRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createTaskSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { tenant_id } = getTenantFilter(c);
  const user = c.get('user');
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      tenant_id,
      title: parsed.data.title,
      description: parsed.data.description,
      due_date: parsed.data.dueDate,
      priority: parsed.data.priority,
      status: parsed.data.status,
      contact_id: parsed.data.contactId,
      company_id: parsed.data.companyId,
      deal_id: parsed.data.dealId,
      assigned_to: parsed.data.assignedTo || user.id,
      tags: parsed.data.tags,
      created_by: user.id,
    })
    .select('*, contact:contacts(*), company:companies(*), deal:deals(*)')
    .single();
  
  if (error) throw error;
  
  return created(c, data);
});

/**
 * PATCH /api/tasks/:id
 * Update a task
 */
tasksRoutes.patch('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const parsed = updateTaskSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.dueDate !== undefined) updates.due_date = parsed.data.dueDate;
  if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.contactId !== undefined) updates.contact_id = parsed.data.contactId;
  if (parsed.data.companyId !== undefined) updates.company_id = parsed.data.companyId;
  if (parsed.data.dealId !== undefined) updates.deal_id = parsed.data.dealId;
  if (parsed.data.assignedTo !== undefined) updates.assigned_to = parsed.data.assignedTo;
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
  updates.updated_at = new Date().toISOString();
  
  // If task is being completed, set completed_at
  if (parsed.data.status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .select('*, contact:contacts(*), company:companies(*), deal:deals(*)')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Task');
    }
    throw error;
  }
  
  return success(c, data);
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
tasksRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenant_id);
  
  if (error) throw error;
  
  return noContent(c);
});

/**
 * PATCH /api/tasks/:id/complete
 * Mark a task as completed
 */
tasksRoutes.patch('/:id/complete', async (c) => {
  const { id } = c.req.param();
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .select()
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Task');
    }
    throw error;
  }
  
  return success(c, data);
});


