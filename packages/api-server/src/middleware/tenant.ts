import { Context, Next } from 'hono';
import { getAdminClient } from '../lib/supabase';
import { errors } from '../lib/response';

/**
 * Tenant context added to requests
 */
export interface TenantContext {
  tenantId: string;
  organizationId?: string;
}

/**
 * Extended context with tenant info
 */
declare module 'hono' {
  interface ContextVariableMap {
    tenant: TenantContext;
  }
}

/**
 * Tenant context middleware
 * Resolves tenant from user context or headers
 */
export async function tenantMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  
  // Get tenant ID from:
  // 1. User's tenant (from auth middleware)
  // 2. X-Tenant-ID header (for platform admins)
  let tenantId = user?.tenantId || c.req.header('X-Tenant-ID');
  const organizationId = c.req.header('X-Organization-ID');
  
  if (!tenantId) {
    // Check if user is a platform admin
    if (user?.role === 'platform_admin') {
      // Platform admins must specify tenant via header
      tenantId = c.req.header('X-Tenant-ID');
      if (!tenantId) {
        return errors.badRequest(c, 'X-Tenant-ID header required for platform admin');
      }
    } else {
      return errors.forbidden(c, 'No tenant context available');
    }
  }
  
  // Validate tenant exists
  const adminClient = getAdminClient();
  const { data: tenant, error } = await adminClient
    .from('tenants')
    .select('id, name, slug')
    .eq('id', tenantId)
    .single();
  
  if (error || !tenant) {
    return errors.notFound(c, 'Tenant');
  }
  
  // Validate organization if provided
  if (organizationId) {
    const { data: org, error: orgError } = await adminClient
      .from('workspaces')
      .select('id')
      .eq('id', organizationId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (orgError || !org) {
      return errors.notFound(c, 'Organization');
    }
  }
  
  // Set tenant context
  c.set('tenant', {
    tenantId,
    organizationId,
  });
  
  await next();
}

/**
 * Optional tenant middleware - doesn't fail if no tenant
 */
export async function optionalTenantMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  const tenantId = user?.tenantId || c.req.header('X-Tenant-ID');
  const organizationId = c.req.header('X-Organization-ID');
  
  if (tenantId) {
    c.set('tenant', {
      tenantId,
      organizationId,
    });
  }
  
  await next();
}

/**
 * Get tenant-scoped query builder helper
 */
export function getTenantFilter(c: Context): { tenant_id: string } {
  const tenant = c.get('tenant');
  if (!tenant) {
    throw new Error('Tenant context not available');
  }
  return { tenant_id: tenant.tenantId };
}


