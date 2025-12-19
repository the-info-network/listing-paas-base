# API Server

A standalone API server built with Hono for the Listing Platform. Provides RESTful endpoints for CRM operations, listing management, authentication, and Stripe webhook handling.

## Features

- 🔐 **Authentication** - JWT-based authentication with Supabase
- 🏢 **Multi-tenancy** - Tenant-scoped data access with automatic filtering
- 📋 **CRM Endpoints** - Contacts, companies, deals, and tasks management
- 📝 **Listings API** - Full CRUD operations for listings
- 💳 **Stripe Integration** - Webhook handling for payment events
- 🛡️ **Security** - CORS, error handling, and input validation
- 🚀 **Cloud Ready** - Dockerfile and Cloud Run configuration included

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.6.1
- Supabase project (local or cloud)

### Installation

```bash
# From root directory
pnpm install

# Or from this directory
cd packages/api-server
pnpm install
```

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_SERVICE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   ```

3. Get your Supabase credentials:
   ```bash
   # If using local Supabase
   supabase status
   
   # Or from Supabase Dashboard → Settings → API
   ```

### Running Locally

```bash
# From root directory
pnpm dev:api

# Or from this directory
pnpm dev
```

The server will start on `http://localhost:8080` (or the port specified in `PORT`).

### Building

```bash
# From root directory
pnpm build:api

# Or from this directory
pnpm build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Production Start

```bash
# From root directory
pnpm start:api

# Or from this directory
pnpm start
```

## API Endpoints

### Health Check

```bash
GET /health
```

Returns server status and timestamp.

### Authentication

All authentication endpoints are public (no auth required):

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user (requires auth)

### CRM Endpoints

All CRM endpoints require authentication and tenant context:

**Contacts**
- `GET /api/contacts` - List contacts (paginated)
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create contact
- `PATCH /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

**Companies**
- `GET /api/companies` - List companies (paginated)
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies` - Create company
- `PATCH /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

**Deals**
- `GET /api/deals` - List deals (paginated)
- `GET /api/deals/:id` - Get deal by ID
- `POST /api/deals` - Create deal
- `PATCH /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

**Tasks**
- `GET /api/tasks` - List tasks (paginated)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Listings Endpoints

All listings endpoints require authentication and tenant context:

- `GET /api/listings` - List listings (paginated, filterable)
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create listing
- `PATCH /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Webhooks

- `POST /api/webhooks/stripe` - Stripe webhook handler (public, signature verified)

## Authentication Flow

1. **Client Login**: Client calls `POST /api/auth/login` with email/password
2. **Receive Token**: Server returns JWT access token and refresh token
3. **Authenticated Requests**: Client includes token in `Authorization: Bearer <token>` header
4. **Token Validation**: Middleware validates token with Supabase
5. **User Context**: User and tenant information extracted and added to request context
6. **Tenant Scoping**: All database queries automatically filtered by tenant

### Example Request

```bash
curl -X GET http://localhost:8080/api/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Tenant Context

The API automatically scopes all data by tenant:

1. **User's Tenant**: Extracted from authenticated user's `tenant_id`
2. **Platform Admins**: Must provide `X-Tenant-ID` header
3. **Organization Context**: Optional `X-Organization-ID` header for workspace-scoped operations

### Example with Tenant Header

```bash
curl -X GET http://localhost:8080/api/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-ID: tenant-uuid-here"
```

## CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000` (admin app)
- `http://localhost:3001` (portal app)

Configure additional origins via `ALLOWED_ORIGINS` environment variable (comma-separated).

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

Common error codes:
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `INTERNAL_ERROR` - Server error

## Environment Variables

See `.env.example` for all available environment variables.

### Required

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key (bypasses RLS)
- `SUPABASE_ANON_KEY` - Anonymous key

### Optional

- `PORT` - Server port (default: 8080)
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NODE_ENV` - Environment (development/production)

## Development

### Project Structure

```
packages/api-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client utilities
│   │   └── response.ts        # Response helpers
│   ├── middleware/
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── tenant.ts         # Tenant context middleware
│   │   └── error-handler.ts  # Error handling middleware
│   └── routes/
│       ├── auth.ts           # Authentication routes
│       ├── contacts.ts       # Contact routes
│       ├── companies.ts      # Company routes
│       ├── deals.ts          # Deal routes
│       ├── tasks.ts          # Task routes
│       ├── listings.ts       # Listing routes
│       └── webhooks/
│           └── stripe.ts     # Stripe webhook handler
├── Dockerfile                # Docker configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

### Adding New Routes

1. Create route file in `src/routes/`
2. Import and mount in `src/index.ts`:

```typescript
import { myRoutes } from './routes/my-routes';

protectedApi.route('/my-resource', myRoutes);
```

3. Use middleware for auth/tenant:

```typescript
import { getTenantFilter } from '../middleware/tenant';

myRoutes.get('/', async (c) => {
  const { tenant_id } = getTenantFilter(c);
  // Use tenant_id in queries
});
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions to Google Cloud Run.

## Testing

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build
```

## Troubleshooting

### "SUPABASE_URL is required" Error

Make sure `.env` file exists and contains `SUPABASE_URL`.

### "Invalid or expired token" Error

- Check token is included in `Authorization` header
- Verify token hasn't expired
- Ensure Supabase credentials are correct

### CORS Errors

- Check `ALLOWED_ORIGINS` includes your frontend URL
- Verify request includes credentials if needed

### Build Errors

- Ensure all dependencies are installed: `pnpm install`
- Check TypeScript version compatibility
- Verify `tsconfig.json` is correct

## License

MIT

