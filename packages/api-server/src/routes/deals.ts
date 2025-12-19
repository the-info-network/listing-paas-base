import { Hono } from 'hono';
import { z } from 'zod';
import { getAdminClient } from '../lib/supabase';
import { success, created, noContent, errors, paginated } from '../lib/response';
import { getTenantFilter } from '../middleware/tenant';

export const dealsRoutes = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const createDealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  stageId: z.string().uuid('Invalid stage ID'),
  contactId: z.string().uuid().optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
  value: z.number().min(0).default(0),
  currency: z.string().length(3).default('USD'),
  probability: z.number().min(0).max(100).optional().nullable(),
  expectedCloseDate: z.string().datetime().optional().nullable(),
  description: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
  customFields: z.record(z.unknown()).optional().nullable(),
});

const updateDealSchema = createDealSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  stageId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'name', 'value', 'expected_close_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/deals
 * List all deals for the tenant
 */
dealsRoutes.get('/', async (c) => {
  const query = listQuerySchema.parse(c.req.query());
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  let dbQuery = supabase
    .from('deals')
    .select('*, contact:contacts(*), company:companies(*), stage:deal_stages(*)', { count: 'exact' })
    .eq('tenant_id', tenant_id)
    .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
    .range((query.page - 1) * query.limit, query.page * query.limit - 1);
  
  if (query.search) {
    dbQuery = dbQuery.ilike('name', `%${query.search}%`);
  }
  
  if (query.stageId) {
    dbQuery = dbQuery.eq('stage_id', query.stageId);
  }
  
  if (query.companyId) {
    dbQuery = dbQuery.eq('company_id', query.companyId);
  }
  
  if (query.contactId) {
    dbQuery = dbQuery.eq('contact_id', query.contactId);
  }
  
  const { data, error, count } = await dbQuery;
  
  if (error) throw error;
  
  return paginated(c, data || [], query.page, query.limit, count || 0);
});

/**
 * GET /api/deals/stages
 * Get all deal stages for the tenant
 */
dealsRoutes.get('/stages', async (c) => {
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('deal_stages')
    .select('*')
    .eq('tenant_id', tenant_id)
    .order('position', { ascending: true });
  
  if (error) throw error;
  
  return success(c, data || []);
});

/**
 * GET /api/deals/pipeline
 * Get deals grouped by stage (for Kanban view)
 */
dealsRoutes.get('/pipeline', async (c) => {
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  // Get stages
  const { data: stages, error: stagesError } = await supabase
    .from('deal_stages')
    .select('*')
    .eq('tenant_id', tenant_id)
    .order('position', { ascending: true });
  
  if (stagesError) throw stagesError;
  
  // Get all deals
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('*, contact:contacts(*), company:companies(*)')
    .eq('tenant_id', tenant_id)
    .order('created_at', { ascending: false });
  
  if (dealsError) throw dealsError;
  
  // Group deals by stage
  const pipeline = (stages || []).map((stage) => ({
    ...stage,
    deals: (deals || []).filter((deal) => deal.stage_id === stage.id),
  }));
  
  return success(c, pipeline);
});

/**
 * GET /api/deals/:id
 * Get a single deal
 */
dealsRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('deals')
    .select('*, contact:contacts(*), company:companies(*), stage:deal_stages(*)')
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Deal');
    }
    throw error;
  }
  
  return success(c, data);
});

/**
 * POST /api/deals
 * Create a new deal
 */
dealsRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createDealSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { tenant_id } = getTenantFilter(c);
  const user = c.get('user');
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('deals')
    .insert({
      tenant_id,
      name: parsed.data.name,
      stage_id: parsed.data.stageId,
      contact_id: parsed.data.contactId,
      company_id: parsed.data.companyId,
      value: parsed.data.value,
      currency: parsed.data.currency,
      probability: parsed.data.probability,
      expected_close_date: parsed.data.expectedCloseDate,
      description: parsed.data.description,
      tags: parsed.data.tags,
      assigned_to: parsed.data.assignedTo,
      custom_fields: parsed.data.customFields,
      created_by: user.id,
    })
    .select('*, contact:contacts(*), company:companies(*), stage:deal_stages(*)')
    .single();
  
  if (error) throw error;
  
  return created(c, data);
});

/**
 * PATCH /api/deals/:id
 * Update a deal
 */
dealsRoutes.patch('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const parsed = updateDealSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.stageId !== undefined) updates.stage_id = parsed.data.stageId;
  if (parsed.data.contactId !== undefined) updates.contact_id = parsed.data.contactId;
  if (parsed.data.companyId !== undefined) updates.company_id = parsed.data.companyId;
  if (parsed.data.value !== undefined) updates.value = parsed.data.value;
  if (parsed.data.currency !== undefined) updates.currency = parsed.data.currency;
  if (parsed.data.probability !== undefined) updates.probability = parsed.data.probability;
  if (parsed.data.expectedCloseDate !== undefined) updates.expected_close_date = parsed.data.expectedCloseDate;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
  if (parsed.data.assignedTo !== undefined) updates.assigned_to = parsed.data.assignedTo;
  if (parsed.data.customFields !== undefined) updates.custom_fields = parsed.data.customFields;
  updates.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .select('*, contact:contacts(*), company:companies(*), stage:deal_stages(*)')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Deal');
    }
    throw error;
  }
  
  return success(c, data);
});

/**
 * DELETE /api/deals/:id
 * Delete a deal
 */
dealsRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenant_id);
  
  if (error) throw error;
  
  return noContent(c);
});


