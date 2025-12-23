-- =============================================================================
-- V1 CONSOLIDATED MIGRATION: AI KNOWLEDGE BASE
-- =============================================================================
-- This migration creates tables for AI-powered features:
-- - pgvector extension for vector similarity search
-- - knowledge_documents: Documents with embeddings for RAG
-- - chat_sessions: Chat conversation sessions
-- - chat_messages: Individual chat messages
-- - Vector search function for RAG retrieval
-- =============================================================================

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- KNOWLEDGE DOCUMENTS TABLE
-- Stores documents and their embeddings for RAG chatbot
-- =============================================================================
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Document content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Vector embedding (1536 dimensions for OpenAI ada-002)
  embedding vector(1536),
  
  -- Source information
  source_type TEXT NOT NULL DEFAULT 'manual',
  source_url TEXT,
  source_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHAT SESSIONS TABLE
-- Stores chat conversation history for context
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Session metadata
  title TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHAT MESSAGES TABLE
-- Stores individual messages in chat sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Context documents used for this message (for RAG)
  context_document_ids UUID[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Vector similarity search index (IVFFlat for performance)
CREATE INDEX IF NOT EXISTS knowledge_documents_embedding_idx 
ON knowledge_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for tenant filtering
CREATE INDEX IF NOT EXISTS knowledge_documents_tenant_id_idx 
ON knowledge_documents(tenant_id);

-- Index for active documents
CREATE INDEX IF NOT EXISTS knowledge_documents_active_idx 
ON knowledge_documents(is_active) 
WHERE is_active = true;

-- Index for user sessions
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx 
ON chat_sessions(user_id);

-- Index for tenant sessions
CREATE INDEX IF NOT EXISTS chat_sessions_tenant_id_idx 
ON chat_sessions(tenant_id);

-- Index for session messages
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx 
ON chat_messages(session_id);

-- Index for recent messages
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx 
ON chat_messages(created_at DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE OR REPLACE FUNCTION update_knowledge_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_knowledge_documents_updated_at
BEFORE UPDATE ON knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION update_knowledge_documents_updated_at();

-- =============================================================================
-- VECTOR SEARCH FUNCTION
-- Find similar documents using vector similarity
-- =============================================================================
CREATE OR REPLACE FUNCTION search_knowledge_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5,
  filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  source_type TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.tenant_id,
    kd.title,
    kd.content,
    kd.excerpt,
    kd.source_type,
    1 - (kd.embedding <=> query_embedding) AS similarity
  FROM knowledge_documents kd
  WHERE 
    kd.is_active = true
    AND (filter_tenant_id IS NULL OR kd.tenant_id = filter_tenant_id)
    AND 1 - (kd.embedding <=> query_embedding) > match_threshold
  ORDER BY kd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Knowledge documents: Active documents are readable, admins can manage
CREATE POLICY knowledge_documents_select_policy ON knowledge_documents
  FOR SELECT
  USING (
    is_active = true
    AND (
      tenant_id IS NULL 
      OR tenant_id = (SELECT current_setting('app.current_tenant_id', true))::uuid
      OR tenant_id = get_current_tenant_id()
    )
  );

CREATE POLICY knowledge_documents_admin_policy ON knowledge_documents
  FOR ALL
  USING (
    is_platform_admin()
    OR (
      tenant_id IS NOT NULL 
      AND tenant_id = get_current_tenant_id()
      AND get_current_user_role() IN ('Platform Admin', 'Workspace Admin')
    )
  );

-- Chat sessions: Users can only see their own sessions
CREATE POLICY chat_sessions_user_policy ON chat_sessions
  FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Chat messages: Users can only see messages from their sessions
CREATE POLICY chat_messages_user_policy ON chat_messages
  FOR ALL
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE knowledge_documents IS 'Stores documents and embeddings for AI RAG chatbot';
COMMENT ON TABLE chat_sessions IS 'Stores chat conversation sessions';
COMMENT ON TABLE chat_messages IS 'Stores individual chat messages';
COMMENT ON FUNCTION search_knowledge_documents IS 'Vector similarity search for RAG context retrieval';
COMMENT ON COLUMN knowledge_documents.embedding IS 'OpenAI ada-002 embedding vector (1536 dimensions)';

