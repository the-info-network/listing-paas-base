import { Hono } from 'hono';
import { z } from 'zod';
import { createAnonClient, getAdminClient } from '../lib/supabase';
import { success, errors } from '../lib/response';

export const authRoutes = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { email, password } = parsed.data;
  const supabase = createAnonClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return errors.unauthorized(c, 'Invalid email or password');
    }
    return errors.badRequest(c, error.message);
  }
  
  // Get user profile
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('id, email, first_name, last_name, tenant_id, avatar_url')
    .eq('id', data.user.id)
    .single();
  
  return success(c, {
    user: {
      id: data.user.id,
      email: data.user.email,
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      avatarUrl: profile?.avatar_url,
      tenantId: profile?.tenant_id,
    },
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      expiresIn: data.session.expires_in,
    },
  });
});

/**
 * POST /api/auth/register
 * Register a new user
 */
authRoutes.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { email, password, firstName, lastName } = parsed.data;
  const supabase = createAnonClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });
  
  if (error) {
    if (error.message.includes('already registered')) {
      return errors.conflict(c, 'An account with this email already exists');
    }
    return errors.badRequest(c, error.message);
  }
  
  if (!data.user) {
    return errors.internalError(c, 'Failed to create user');
  }
  
  return success(c, {
    user: {
      id: data.user.id,
      email: data.user.email,
      emailConfirmed: !!data.user.email_confirmed_at,
    },
    message: data.user.email_confirmed_at 
      ? 'Account created successfully'
      : 'Please check your email to confirm your account',
  }, undefined, 201);
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json();
  const parsed = refreshSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { refreshToken } = parsed.data;
  const supabase = createAnonClient();
  
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });
  
  if (error || !data.session) {
    return errors.unauthorized(c, 'Invalid or expired refresh token');
  }
  
  return success(c, {
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      expiresIn: data.session.expires_in,
    },
  });
});

/**
 * POST /api/auth/logout
 * Sign out the current user
 */
authRoutes.post('/logout', async (c) => {
  // Get token from header
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return success(c, { message: 'Logged out' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createAnonClient();
  
  // Set the session and sign out
  await supabase.auth.setSession({
    access_token: token,
    refresh_token: '', // Not needed for signOut
  });
  
  await supabase.auth.signOut();
  
  return success(c, { message: 'Logged out successfully' });
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
authRoutes.post('/forgot-password', async (c) => {
  const body = await c.req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { email } = parsed.data;
  const supabase = createAnonClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/reset-password`,
  });
  
  if (error) {
    // Don't reveal if email exists or not
    console.error('Password reset error:', error.message);
  }
  
  // Always return success to prevent email enumeration
  return success(c, {
    message: 'If an account with that email exists, a password reset link has been sent',
  });
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
authRoutes.post('/reset-password', async (c) => {
  const body = await c.req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  
  if (!parsed.success) {
    return errors.validationError(c, parsed.error.errors);
  }
  
  const { password } = parsed.data;
  
  // Note: The token is typically handled by Supabase's built-in flow
  // This endpoint is called after the user clicks the reset link
  // and Supabase has already verified the token
  
  const supabase = createAnonClient();
  
  const { error } = await supabase.auth.updateUser({
    password,
  });
  
  if (error) {
    return errors.badRequest(c, error.message);
  }
  
  return success(c, {
    message: 'Password updated successfully',
  });
});

/**
 * GET /api/auth/me
 * Get current user info (requires auth)
 */
authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return errors.unauthorized(c, 'Missing Authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createAnonClient();
  
  // Verify token
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return errors.unauthorized(c, 'Invalid or expired token');
  }
  
  // Get user profile
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('id, email, first_name, last_name, tenant_id, avatar_url, created_at')
    .eq('id', user.id)
    .single();
  
  // Get user's role
  let role: string | undefined;
  if (profile?.tenant_id) {
    const { data: roleData } = await adminClient
      .from('user_tenant_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .eq('tenant_id', profile.tenant_id)
      .single();
    
    // Extract role name from joined data
    const roles = roleData?.roles as unknown;
    if (roles && typeof roles === 'object' && 'name' in roles) {
      role = (roles as { name: string }).name;
    }
  }
  
  return success(c, {
    id: user.id,
    email: user.email,
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    avatarUrl: profile?.avatar_url,
    tenantId: profile?.tenant_id,
    role,
    createdAt: profile?.created_at,
  });
});


