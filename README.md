# TinAdmin SaaS Base V1.0

> **Enterprise-ready SaaS admin dashboard with CRM, multi-tenancy, Stripe billing, and role-based access control**

TinAdmin SaaS Base is a production-ready foundation for building B2B SaaS applications. Built with Next.js 15, Supabase, and Stripe, it provides everything you need to launch your SaaS product.

## 🚀 V1.0 Features

### Multi-Tenancy & Access Control
- **Multi-tenant architecture** with complete data isolation via Row Level Security (RLS)
- **Role-based access control (RBAC)** with 5 default roles:
  - Platform Admin (global access)
  - Workspace Admin (tenant-level management)
  - Billing Owner (subscription management)
  - Developer (API and webhook access)
  - Viewer (read-only access)
- **Workspace management** for organizing teams within tenants
- **Audit logging** for compliance and security

### Billing & Payments
- **Stripe integration** with subscription management
- Support for **monthly and annual billing cycles**
- **Payment method management** (cards, bank accounts)
- **Invoice history** and downloadable PDFs
- **Webhook handling** for real-time subscription updates

### CRM System
- **Companies** - Track organizations with custom fields
- **Contacts** - Manage individual contacts linked to companies
- **Deals** - Sales pipeline with Kanban board stages
- **Tasks** - Action items with due dates and reminders
- **Notes** - Activity history (calls, emails, meetings)
- **Activity Timeline** - Complete interaction history

### White-Label Customization
- **Custom branding** (logo, colors, favicon)
- **Theme settings** (light/dark mode, fonts, animations)
- **Custom CSS** injection for advanced styling
- **Custom domains** support with SSL

### AI-Powered Features
- **RAG Chatbot** with vector similarity search (pgvector)
- **Knowledge base** for document embeddings
- **OpenAI integration** for chat and recommendations

### Developer Experience
- **Turborepo monorepo** for optimal build performance
- **TypeScript** throughout with strict typing
- **Modular packages** for code reuse
- **API server** with Express for backend operations
- **Comprehensive configuration** via environment variables

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **Backend** | Supabase (Postgres + Auth), Express API |
| **Payments** | Stripe (subscriptions, invoices, webhooks) |
| **Search** | Typesense (optional) |
| **AI** | OpenAI (embeddings, chat), pgvector |
| **Storage** | Wasabi/S3-compatible cloud storage |
| **Maps** | Mapbox / Google Maps |
| **Monorepo** | Turborepo, pnpm |

## 🏗️ Architecture

```
listing-platform-as-a-service/
├── apps/
│   ├── admin/          # Admin dashboard (Next.js)
│   └── portal/         # Consumer portal (Next.js)
├── packages/
│   ├── @tinadmin/
│   │   ├── core/       # Core utilities and types
│   │   ├── config/     # Shared configuration
│   │   └── ui-*/       # UI component libraries
│   └── @listing-platform/
│       ├── ai/         # AI/ML features
│       ├── auth/       # Authentication utilities
│       ├── crm/        # CRM components
│       ├── media/      # Media upload/management
│       ├── payments/   # Stripe integration
│       ├── search/     # Search functionality
│       └── shared/     # Shared utilities
├── supabase/
│   ├── migrations/     # Individual migrations
│   └── migrations-v1/  # Consolidated V1 migrations
└── config/             # Global configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or later
- pnpm 10.x
- Docker (for local Supabase)

### Installation

1. **Clone and install dependencies:**

```bash
git clone https://github.com/tindevelopers/tinadmin-saas-base.git
cd tinadmin-saas-base
pnpm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start local Supabase:**

```bash
pnpm supabase:start
```

4. **Run development servers:**

```bash
# Run all apps
pnpm dev

# Or run specific apps
pnpm dev:admin   # Admin dashboard on :3001
pnpm dev:portal  # Portal on :3000
pnpm dev:api     # API server on :4000
```

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [📖 User Guide](docs/USER_GUIDE.md) | Installation and customization |
| [👨‍💻 Developer Guide](docs/DEVELOPER_GUIDE.md) | Advanced development |
| [⚙️ Configuration Guide](docs/CONFIGURATION_GUIDE.md) | Environment variables |
| [💳 Stripe Setup](README_STRIPE.md) | Payment integration |
| [🏠 Local Setup](README_LOCAL_SETUP.md) | Local development |

## 🗄️ Database Schema

The V1 schema includes the following modules:

### Core Tables
- `tenants` - Organizations with white-label settings
- `users` - User accounts with role assignments
- `roles` - RBAC roles with permissions
- `audit_logs` - Compliance audit trail

### Workspaces
- `workspaces` - Team organization within tenants
- `workspace_users` - User ↔ workspace assignments
- `user_tenant_roles` - Cross-tenant role assignments

### Billing (Stripe)
- `stripe_customers`, `stripe_subscriptions`
- `stripe_payment_methods`, `stripe_invoices`
- `stripe_products`, `stripe_prices`

### CRM
- `companies`, `contacts`, `deals`
- `deal_stages`, `tasks`, `notes`, `activities`

### AI
- `knowledge_documents` - Vector embeddings for RAG
- `chat_sessions`, `chat_messages`

See `supabase/migrations-v1/` for consolidated migrations.

## 🔧 Scripts

```bash
# Development
pnpm dev              # Run all apps
pnpm dev:admin        # Admin dashboard only
pnpm dev:portal       # Portal only
pnpm dev:api          # API server only

# Building
pnpm build            # Build all apps
pnpm build:packages   # Build packages only

# Database
pnpm supabase:start   # Start local Supabase
pnpm supabase:stop    # Stop local Supabase
pnpm supabase:reset   # Reset database

# Quality
pnpm lint             # Run linting
pnpm type-check       # TypeScript checks
pnpm test             # Run tests
```

## 🔐 Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI (for AI features)
OPENAI_API_KEY=

# Multi-tenancy
NEXT_PUBLIC_MULTI_TENANT_ENABLED=false
NEXT_PUBLIC_TENANT_RESOLUTION=subdomain
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Docker

```bash
docker build -t tinadmin-saas .
docker run -p 3000:3000 tinadmin-saas
```

### Railway / Render

Follow standard Next.js deployment guides for your platform.

## 📝 Changelog

### Version 1.0.0 - December 2024

**Initial V1 Release with:**
- ✅ Multi-tenant architecture with RLS
- ✅ 5-role RBAC system
- ✅ Complete Stripe billing integration
- ✅ Full CRM system (companies, contacts, deals, tasks)
- ✅ AI knowledge base with pgvector
- ✅ White-label customization
- ✅ Audit logging
- ✅ Workspace management

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

**Built with ❤️ by [Tin Developers](https://tindevelopers.com)**

Last Updated: December 2024 | Version: 1.0.0
