# TinAdmin SaaS Base - V1 Consolidated Migrations

This folder contains **5 consolidated SQL migrations** that set up the complete V1 database schema for TinAdmin SaaS Base.

## Migration Files

| File | Description |
|------|-------------|
| `001_core_schema.sql` | Core tables: tenants, users, roles, audit_logs + RLS helper functions |
| `002_workspaces_and_roles.sql` | Workspaces, workspace_users, user_tenant_roles for organization hierarchy |
| `003_stripe_billing.sql` | Complete Stripe integration: customers, subscriptions, invoices, payments |
| `004_crm_system.sql` | Full CRM: companies, contacts, deals, tasks, notes, activities |
| `005_ai_knowledge_base.sql` | AI features: pgvector, knowledge documents, chat sessions/messages |

## Usage

### Fresh Installation

For a new Supabase project, run these migrations in order:

```bash
# Using Supabase CLI
supabase db reset

# Or manually apply each migration
psql $DATABASE_URL < 001_core_schema.sql
psql $DATABASE_URL < 002_workspaces_and_roles.sql
psql $DATABASE_URL < 003_stripe_billing.sql
psql $DATABASE_URL < 004_crm_system.sql
psql $DATABASE_URL < 005_ai_knowledge_base.sql
```

### Existing Projects

If you have an existing database with the individual migrations from `supabase/migrations/`, these consolidated migrations are **for reference only**. Your existing migrations should continue to work.

## Schema Overview

### Core Schema (001)
- **tenants** - Organizations using the platform with white-label settings
- **roles** - RBAC roles with permissions (Platform Admin, Workspace Admin, etc.)
- **users** - User accounts linked to tenants and roles
- **audit_logs** - System-wide audit logging for compliance

### Workspaces (002)
- **workspaces** - Sub-divisions within tenants for team organization
- **workspace_users** - Many-to-many user ↔ workspace with role assignments
- **user_tenant_roles** - Allows Platform Admins to have tenant-specific roles

### Billing (003)
- **stripe_products** / **stripe_prices** - Product catalog from Stripe
- **stripe_customers** - Customer records synced with Stripe
- **stripe_subscriptions** - Active and historical subscriptions
- **stripe_payment_methods** - Saved cards and bank accounts
- **stripe_invoices** - Billing history
- **stripe_payment_intents** - One-time payment tracking
- **stripe_webhook_events** - Webhook logging for debugging

### CRM (004)
- **companies** - Business organizations
- **contacts** - Individual contacts linked to companies
- **deal_stages** - Kanban board stages (Lead → Qualified → Proposal → Won/Lost)
- **deals** - Sales opportunities with values and probabilities
- **tasks** - Action items linked to contacts/companies/deals
- **notes** - Notes, emails, calls, meetings
- **activities** - Activity timeline for all entities

### AI Knowledge Base (005)
- **knowledge_documents** - Documents with vector embeddings for RAG
- **chat_sessions** - Chat conversation sessions
- **chat_messages** - Individual messages in sessions
- **search_knowledge_documents()** - Vector similarity search function

## Row Level Security (RLS)

All tables have Row Level Security enabled with policies for:
- **Platform Admins** - Full access to all data
- **Tenant Users** - Access to their tenant's data only
- **Self-service** - Users can update their own profiles

## Default Data

The migrations create default roles:
1. **Platform Admin** - Full system control
2. **Workspace Admin** - Tenant-level management
3. **Billing Owner** - Subscription and billing management
4. **Developer** - API access and webhooks
5. **Viewer** - Read-only access

## Notes

- These migrations assume Supabase Auth is configured
- pgvector extension is required for AI features
- Stripe webhook integration requires `STRIPE_WEBHOOK_SECRET`

