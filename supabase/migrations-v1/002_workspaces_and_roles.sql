-- =============================================================================
-- V1 CONSOLIDATED MIGRATION: WORKSPACES AND EXTENDED ROLES
-- =============================================================================
-- This migration creates:
-- - workspaces: Sub-divisions within tenants
-- - workspace_users: Many-to-many relationship between users and workspaces
-- - user_tenant_roles: Allows Platform Admins to have tenant-specific roles
-- =============================================================================

-- =============================================================================
-- WORKSPACES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- =============================================================================
-- WORKSPACE_USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS workspace_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  permissions TEXT[] DEFAULT '{}',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- =============================================================================
-- USER_TENANT_ROLES TABLE
-- Allows Platform Admins to have tenant-specific roles
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_tenant_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tenant_id, role_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_workspaces_tenant_id ON workspaces(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_status ON workspaces(status);
CREATE INDEX IF NOT EXISTS idx_workspace_users_workspace_id ON workspace_users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_users_user_id ON workspace_users(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_users_role_id ON workspace_users(role_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_roles_user_id ON user_tenant_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_roles_tenant_id ON user_tenant_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_roles_role_id ON user_tenant_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_roles_user_tenant ON user_tenant_roles(user_id, tenant_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE OR REPLACE FUNCTION update_workspaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_workspaces_updated_at();

CREATE OR REPLACE FUNCTION update_user_tenant_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_tenant_roles_updated_at BEFORE UPDATE ON user_tenant_roles
  FOR EACH ROW EXECUTE FUNCTION update_user_tenant_roles_updated_at();

-- =============================================================================
-- AUTO-CREATE DEFAULT WORKSPACE ON TENANT CREATION
-- =============================================================================
CREATE OR REPLACE FUNCTION create_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspaces (tenant_id, name, slug, description)
  VALUES (
    NEW.id,
    NEW.name || ' Workspace',
    'default',
    'Default workspace for ' || NEW.name
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_default_workspace_on_tenant_create
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION create_default_workspace();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenant_roles ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Platform admins can view all workspaces"
  ON workspaces FOR SELECT USING (is_platform_admin());

CREATE POLICY "Users can view workspaces in their tenant"
  ON workspaces FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR tenant_id = get_current_tenant_id()
  );

CREATE POLICY "Platform admins can manage all workspaces"
  ON workspaces FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY "Tenant admins can manage workspaces"
  ON workspaces FOR ALL
  USING (
    tenant_id = get_current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.tenant_id = get_current_tenant_id()
      AND users.role_id IN (SELECT id FROM roles WHERE name IN ('Platform Admin', 'Workspace Admin'))
    )
  )
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.tenant_id = get_current_tenant_id()
      AND users.role_id IN (SELECT id FROM roles WHERE name IN ('Platform Admin', 'Workspace Admin'))
    )
  );

-- Workspace users policies
CREATE POLICY "Platform admins can view all workspace users"
  ON workspace_users FOR SELECT USING (is_platform_admin());

CREATE POLICY "Users can view workspace users for their workspaces"
  ON workspace_users FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid())
    OR workspace_id IN (
      SELECT id FROM workspaces 
      WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Platform admins can manage workspace users"
  ON workspace_users FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY "Tenant admins can manage workspace users"
  ON workspace_users FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE tenant_id = get_current_tenant_id()
      AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.tenant_id = get_current_tenant_id()
        AND users.role_id IN (SELECT id FROM roles WHERE name IN ('Platform Admin', 'Workspace Admin'))
      )
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE tenant_id = get_current_tenant_id()
      AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.tenant_id = get_current_tenant_id()
        AND users.role_id IN (SELECT id FROM roles WHERE name IN ('Platform Admin', 'Workspace Admin'))
      )
    )
  );

-- User tenant roles policies
CREATE POLICY "Platform admins can view all user tenant roles"
  ON user_tenant_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'Platform Admin'
    )
  );

CREATE POLICY "Users can view their own tenant roles"
  ON user_tenant_roles FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can view tenant roles"
  ON user_tenant_roles FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND u.tenant_id = user_tenant_roles.tenant_id
      AND r.name IN ('Platform Admin', 'Workspace Admin')
    )
  );

CREATE POLICY "Platform admins can manage all user tenant roles"
  ON user_tenant_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'Platform Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'Platform Admin'
    )
  );

CREATE POLICY "Tenant admins can manage roles for their tenant"
  ON user_tenant_roles FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND u.tenant_id = user_tenant_roles.tenant_id
      AND r.name IN ('Platform Admin', 'Workspace Admin')
    )
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND u.tenant_id = user_tenant_roles.tenant_id
      AND r.name IN ('Platform Admin', 'Workspace Admin')
    )
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE workspaces IS 'Sub-divisions within tenants for organizing teams and projects';
COMMENT ON TABLE workspace_users IS 'Many-to-many relationship between users and workspaces with role assignments';
COMMENT ON TABLE user_tenant_roles IS 'Junction table allowing Platform Admins to have tenant-specific roles';

