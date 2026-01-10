# API Server Environment Variables

## Required Environment Variables for Vercel

Set these in Vercel Dashboard → Settings → Environment Variables for the `api-server` project:

### Supabase Configuration
```
SUPABASE_URL=https://omczmkjrpsykpwiyptfj.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tY3pta2pycHN5a3B3aXlwdGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5ODIyMjMsImV4cCI6MjA4MzU1ODIyM30.JZnXOYmO-fxR1i9ak13_TKqXLBF40ETHHr0P26hqd5s
```

**Note:** `SUPABASE_SERVICE_KEY` should be your Supabase service role key (not the anon key). Get it from:
- Supabase Dashboard → Settings → API → `service_role` key (secret)

### Optional Environment Variables

```
NODE_ENV=production
PORT=8080
API_URL=https://pawpointers-api.tinconnect.com
API_KEY_SECRET=<random-secret-for-api-key-hashing>
```

### OAuth Configuration (Optional - for video integrations)
```
ZOOM_CLIENT_ID=<zoom-client-id>
ZOOM_CLIENT_SECRET=<zoom-client-secret>
ZOOM_REDIRECT_URI=<zoom-redirect-uri>
MICROSOFT_CLIENT_ID=<microsoft-client-id>
MICROSOFT_CLIENT_SECRET=<microsoft-client-secret>
MICROSOFT_REDIRECT_URI=<microsoft-redirect-uri>
```

### Search Configuration (Optional - for Typesense)
```
TYPESENSE_API_KEY=<typesense-api-key>
TYPESENSE_HOST=<typesense-host>
```

## How to Set Environment Variables in Vercel

1. Go to https://vercel.com/tindeveloper/api-server/settings/environment-variables
2. Add each variable above
3. Select environments: Production, Preview, Development
4. Click "Save"
5. Redeploy the application

## Testing

After setting environment variables, test the API:
```bash
curl https://pawpointers-api.tinconnect.com/api/public/categories
curl https://pawpointers-api.tinconnect.com/health
```

## Troubleshooting

If you get 500 errors:
1. Check Vercel function logs: `vercel logs api-server`
2. Verify `SUPABASE_SERVICE_KEY` is set correctly
3. Verify database tables exist (`taxonomy_terms`, `listings`, etc.)
4. Check CORS configuration

