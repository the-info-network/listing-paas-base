import { Hono } from 'hono';
import { z } from 'zod';
import { getAdminClient } from '../lib/supabase';
import { success, created, noContent, errors, paginated } from '../lib/response';
import { getTenantFilter } from '../middleware/tenant';

export const contactsRoutes = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable(),
  customFields: z.record(z.unknown()).optional().nullable(),
});

const updateContactSchema = createContactSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'first_name', 'last_name']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/contacts
 * List all contacts for the tenant
 */
contactsRoutes.get('/', async (c) => {
  const query = listQuerySchema.parse(c.req.query());
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  // Build query
  let dbQuery = supabase
    .from('contacts')
    .select('*, company:companies(*)', { count: 'exact' })
    .eq('tenant_id', tenant_id)
    .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
    .range((query.page - 1) * query.limit, query.page * query.limit - 1);
  
  // Apply filters
  if (query.search) {
    dbQuery = dbQuery.or(`first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%,email.ilike.%${query.search}%`);
  }
  
  if (query.companyId) {
    dbQuery = dbQuery.eq('company_id', query.companyId);
  }
  
  const { data, error, count } = await dbQuery;
  
  if (error) throw error;
  
  return paginated(c, data || [], query.page, query.limit, count || 0);
});

/**
 * GET /api/contacts/:id
 * Get a single contact
 */
contactsRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('contacts')
    .select('*, company:companies(*)')
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Contact');
    }
    throw error;
  }
  
  return success(c, data);
});

/**
 * POST /api/contacts
 * Create a new contact
 */
contactsRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createContactSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { tenant_id } = getTenantFilter(c);
  const user = c.get('user');
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      tenant_id,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      mobile: parsed.data.mobile,
      company_id: parsed.data.companyId,
      job_title: parsed.data.jobTitle,
      department: parsed.data.department,
      address: parsed.data.address,
      tags: parsed.data.tags,
      notes: parsed.data.notes,
      custom_fields: parsed.data.customFields,
      created_by: user.id,
    })
    .select('*, company:companies(*)')
    .single();
  
  if (error) throw error;
  
  return created(c, data);
});

/**
 * PATCH /api/contacts/:id
 * Update a contact
 */
contactsRoutes.patch('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const parsed = updateContactSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  // Build update object (only include provided fields)
  const updates: Record<string, unknown> = {};
  if (parsed.data.firstName !== undefined) updates.first_name = parsed.data.firstName;
  if (parsed.data.lastName !== undefined) updates.last_name = parsed.data.lastName;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
  if (parsed.data.mobile !== undefined) updates.mobile = parsed.data.mobile;
  if (parsed.data.companyId !== undefined) updates.company_id = parsed.data.companyId;
  if (parsed.data.jobTitle !== undefined) updates.job_title = parsed.data.jobTitle;
  if (parsed.data.department !== undefined) updates.department = parsed.data.department;
  if (parsed.data.address !== undefined) updates.address = parsed.data.address;
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
  if (parsed.data.customFields !== undefined) updates.custom_fields = parsed.data.customFields;
  updates.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .select('*, company:companies(*)')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Contact');
    }
    throw error;
  }
  
  return success(c, data);
});

/**
 * DELETE /api/contacts/:id
 * Delete a contact
 */
contactsRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const { tenant_id } = getTenantFilter(c);
  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenant_id);
  
  if (error) throw error;
  
  return noContent(c);
});


