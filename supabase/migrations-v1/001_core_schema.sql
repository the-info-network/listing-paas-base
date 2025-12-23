-- =============================================================================
-- V1 CONSOLIDATED MIGRATION: CORE SCHEMA
-- =============================================================================
-- This migration creates the core tables for multi-tenancy:
-- - tenants: Organizations/companies using the platform
-- - roles: User roles with permissions
-- - users: User accounts linked to tenants and roles
-- - audit_logs: System-wide audit logging
-- - RLS helper functions for security
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TENANTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  plan TEXT NOT NULL,
  region TEXT NOT NULL,
  avatar_url TEXT,
  features TEXT[] DEFAULT '{}',
  -- White label settings
  branding JSONB DEFAULT '{}'::jsonb,
  theme_settings JSONB DEFAULT '{}'::jsonb,
  email_settings JSONB DEFAULT '{}'::jsonb,
  custom_css TEXT DEFAULT '',
  custom_domains JSONB DEFAULT '[]'::jsonb,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROLES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  coverage TEXT NOT NULL,
  max_seats INTEGER NOT NULL DEFAULT 0,
  current_seats INTEGER NOT NULL DEFAULT 0,
  permissions TEXT[] DEFAULT '{}',
  gradient TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- AUDIT LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_branding ON tenants USING GIN (branding);
CREATE INDEX IF NOT EXISTS idx_tenants_theme_settings ON tenants USING GIN (theme_settings);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RLS HELPER FUNCTIONS (Security Definer to avoid recursion)
-- =============================================================================

-- Check if current user is a platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name = 'Platform Admin'
    AND u.tenant_id IS NULL
  );
$$;

-- Get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- Get current user's role name
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT r.name
  FROM users u
  JOIN roles r ON u.role_id = r.id
  WHERE u.id = auth.uid()
  LIMIT 1;
$$;

-- Get current user's tenant_id (alias)
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_tenant_id() TO authenticated, anon, service_role;

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenants policies
CREATE POLICY "Platform admins can view all tenants"
  ON tenants FOR SELECT USING (is_platform_admin());

CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT USING (id = get_current_tenant_id());

CREATE POLICY "Platform admins can manage all tenants"
  ON tenants FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- Roles policies
CREATE POLICY "Allow read access to roles for authenticated users"
  ON roles FOR SELECT USING (true);

CREATE POLICY "Platform admins can manage roles"
  ON roles FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- Users policies (non-recursive using helper functions)
CREATE POLICY "Users can view themselves"
  ON users FOR SELECT USING (id = auth.uid());

CREATE POLICY "Platform admins can view all users"
  ON users FOR SELECT USING (auth.uid() IS NOT NULL AND get_current_user_role() = 'Platform Admin');

CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND tenant_id IS NOT NULL
    AND tenant_id = get_current_user_tenant_id()
  );

CREATE POLICY "Platform admins can manage all users"
  ON users FOR ALL
  USING (auth.uid() IS NOT NULL AND get_current_user_role() = 'Platform Admin')
  WITH CHECK (auth.uid() IS NOT NULL AND get_current_user_role() = 'Platform Admin');

CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Audit logs policies
CREATE POLICY "Platform admins can view all audit logs"
  ON audit_logs FOR SELECT USING (is_platform_admin());

CREATE POLICY "Users can view audit logs in their tenant"
  ON audit_logs FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT WITH CHECK (true);

-- =============================================================================
-- DEFAULT DATA
-- =============================================================================
INSERT INTO roles (name, description, coverage, max_seats, current_seats, permissions, gradient)
VALUES
  ('Platform Admin', 'Full system control, audit exports, billing + API scope.', 'Global', 40, 0, ARRAY['All permissions', 'Billing', 'API keys', 'Audit logs'], 'from-indigo-500 to-purple-500'),
  ('Workspace Admin', 'Brand, roles, data residency, tenant level automations.', 'Regional', 180, 0, ARRAY['Workspace settings', 'User management', 'Branding'], 'from-emerald-500 to-teal-500'),
  ('Billing Owner', 'Plan changes, usage alerts, dunning + collections.', 'Per tenant', 60, 0, ARRAY['Billing', 'Usage reports', 'Payment methods'], 'from-amber-500 to-orange-500'),
  ('Developer', 'API keys, webhooks, environments, feature flags.', 'Per project', 500, 0, ARRAY['API access', 'Webhooks', 'Feature flags'], 'from-sky-500 to-blue-500'),
  ('Viewer', 'Read-only access to dashboards and reports.', 'Per workspace', 200, 0, ARRAY['View dashboards', 'View reports'], 'from-gray-400 to-gray-600')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE tenants IS 'Organizations/companies using the platform with white-label settings';
COMMENT ON TABLE roles IS 'User roles with permissions for RBAC';
COMMENT ON TABLE users IS 'User accounts linked to tenants and roles';
COMMENT ON TABLE audit_logs IS 'System-wide audit logging for compliance';
COMMENT ON COLUMN tenants.branding IS 'Branding settings: {companyName, logo, favicon, primaryColor, secondaryColor, supportEmail, supportPhone}';
COMMENT ON COLUMN tenants.theme_settings IS 'Theme settings: {themeMode, fontFamily, fontSize, borderRadius, enableAnimations, enableRipple}';
COMMENT ON COLUMN tenants.email_settings IS 'Email customization: {fromName, fromEmail, replyTo, footerText, headerLogo, headerColor, footerColor}';
COMMENT ON COLUMN tenants.custom_css IS 'Custom CSS code for white-label customization';
COMMENT ON COLUMN tenants.custom_domains IS 'Array of custom domains: [{domain, type, status, sslStatus, verified}]';

