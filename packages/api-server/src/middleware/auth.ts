import { Context, Next } from 'hono';
import { createUserClient, getAdminClient } from '../lib/supabase';
import { errors } from '../lib/response';

/**
 * User context added to requests after authentication
 */
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  tenantId?: string;
}

/**
 * Extended context with auth user
 */
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
    accessToken: string;
  }
}

/**
 * Authentication middleware
 * Validates JWT token from Authorization header and adds user to context
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return errors.unauthorized(c, 'Missing Authorization header');
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return errors.unauthorized(c, 'Invalid Authorization header format. Use: Bearer <token>');
  }
  
  const token = parts[1];
  
  try {
    // Verify the token with Supabase
    const supabase = createUserClient(token);
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Auth error:', error?.message);
      return errors.unauthorized(c, 'Invalid or expired token');
    }
    
    // Get user's tenant and role from the database
    const adminClient = getAdminClient();
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('id, email, tenant_id')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      console.error('User lookup error:', userError.message);
      // User might not exist in users table yet (first login)
    }
    
    // Get user's role
    let role: string | undefined;
    if (userData?.tenant_id) {
      const { data: roleData } = await adminClient
        .from('user_tenant_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .eq('tenant_id', userData.tenant_id)
        .single();
      
      // Extract role name from joined data
      const roles = roleData?.roles as unknown;
      if (roles && typeof roles === 'object' && 'name' in roles) {
        role = (roles as { name: string }).name;
      }
    }
    
    // Set user context
    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      role,
      tenantId: userData?.tenant_id,
    };
    
    c.set('user', authUser);
    c.set('accessToken', token);
    
    await next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return errors.unauthorized(c, 'Authentication failed');
  }
}

/**
 * Optional auth middleware - doesn't fail if no token, but sets user if present
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    await next();
    return;
  }
  
  // Try to authenticate, but don't fail if it doesn't work
  try {
    await authMiddleware(c, next);
  } catch {
    await next();
  }
}

/**
 * Role-based access control middleware factory
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return errors.unauthorized(c, 'Authentication required');
    }
    
    if (!user.role || !allowedRoles.includes(user.role)) {
      return errors.forbidden(c, `Required role: ${allowedRoles.join(' or ')}`);
    }
    
    await next();
  };
}


