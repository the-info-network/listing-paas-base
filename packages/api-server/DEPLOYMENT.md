# Deployment Guide - Google Cloud Run

This guide walks you through deploying the API server to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** - Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud CLI** - Install from [cloud.google.com/sdk](https://cloud.google.com/sdk)
3. **Docker** - For local testing (optional)
4. **Project Setup** - Create a GCP project and enable billing

## Initial Setup

### 1. Install Google Cloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### 2. Authenticate

```bash
gcloud auth login
gcloud auth application-default login
```

### 3. Set Your Project

```bash
gcloud config set project YOUR_PROJECT_ID
```

### 4. Enable Required APIs

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com
```

## Environment Variables Setup

### Option 1: Using Secret Manager (Recommended for Production)

1. **Create secrets**:

```bash
# Supabase URL
echo -n "https://your-project.supabase.co" | \
  gcloud secrets create supabase-url --data-file=-

# Supabase Service Key
echo -n "your-service-role-key" | \
  gcloud secrets create supabase-service-key --data-file=-

# Supabase Anon Key
echo -n "your-anon-key" | \
  gcloud secrets create supabase-anon-key --data-file=-

# Allowed Origins
echo -n "https://your-domain.com,https://admin.your-domain.com" | \
  gcloud secrets create allowed-origins --data-file=-

# Stripe Secret Key (if using)
echo -n "sk_live_..." | \
  gcloud secrets create stripe-secret-key --data-file=-

# Stripe Webhook Secret (if using)
echo -n "whsec_..." | \
  gcloud secrets create stripe-webhook-secret --data-file=-
```

2. **Grant Cloud Run access**:

```bash
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding supabase-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding supabase-service-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding supabase-anon-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding allowed-origins \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Option 2: Using Environment Variables (Simpler, Less Secure)

Set environment variables directly in Cloud Run service configuration (see deployment steps below).

## Deployment Methods

### Method 1: Using Cloud Build (Recommended)

1. **Update `cloudbuild.yaml`** with your substitution variables or use Secret Manager references.

2. **Submit build**:

```bash
cd packages/api-server
gcloud builds submit --config=cloudbuild.yaml
```

3. **Or create a trigger** in Cloud Build UI:
   - Connect your repository
   - Use `cloudbuild.yaml` as the configuration file
   - Set substitution variables or use Secret Manager

### Method 2: Manual Docker Build and Deploy

1. **Build Docker image**:

```bash
cd packages/api-server
docker build -t gcr.io/YOUR_PROJECT_ID/api-server:latest .
```

2. **Push to Container Registry**:

```bash
docker push gcr.io/YOUR_PROJECT_ID/api-server:latest
```

3. **Deploy to Cloud Run**:

```bash
gcloud run deploy api-server \
  --image gcr.io/YOUR_PROJECT_ID/api-server:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "SUPABASE_URL=https://your-project.supabase.co,SUPABASE_SERVICE_KEY=your-key,SUPABASE_ANON_KEY=your-key,PORT=8080,NODE_ENV=production,ALLOWED_ORIGINS=https://your-domain.com"
```

### Method 3: Using Secret Manager (Most Secure)

```bash
gcloud run deploy api-server \
  --image gcr.io/YOUR_PROJECT_ID/api-server:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --update-secrets SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_KEY=supabase-service-key:latest,SUPABASE_ANON_KEY=supabase-anon-key:latest,ALLOWED_ORIGINS=allowed-origins:latest \
  --set-env-vars "PORT=8080,NODE_ENV=production"
```

## Configuration Options

### Memory and CPU

- **Memory**: 512Mi (default) - Increase if handling large payloads
- **CPU**: 1 (default) - Increase for CPU-intensive operations
- **Concurrency**: Default is 80 requests per instance

### Scaling

- **Min Instances**: 0 (scales to zero when idle) - Set to 1+ to avoid cold starts
- **Max Instances**: 10 (default) - Increase based on expected load

### Timeout

- **Timeout**: 300 seconds (5 minutes) - Maximum request duration

### Example with Custom Settings

```bash
gcloud run deploy api-server \
  --image gcr.io/YOUR_PROJECT_ID/api-server:latest \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 50 \
  --timeout 300 \
  --concurrency 100
```

## Post-Deployment

### 1. Get Service URL

```bash
gcloud run services describe api-server \
  --region us-central1 \
  --format="value(status.url)"
```

### 2. Test Health Endpoint

```bash
curl https://api-server-xxxxx.run.app/health
```

### 3. Update Frontend Configuration

Update your admin/portal apps to use the new API URL:

```env
NEXT_PUBLIC_API_URL=https://api-server-xxxxx.run.app
```

### 4. Configure Custom Domain (Optional)

```bash
gcloud run domain-mappings create \
  --service api-server \
  --domain api.your-domain.com \
  --region us-central1
```

Then update your DNS with the provided records.

## Monitoring and Logging

### View Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=api-server" \
  --limit 50 \
  --format json
```

### Set Up Alerts

1. Go to Cloud Console → Monitoring → Alerting
2. Create alert policy for:
   - High error rate
   - High latency
   - Instance count
   - Memory/CPU usage

## Troubleshooting

### Build Fails: "Cannot find module"

**Solution**: Ensure `package.json` dependencies are correct and `npm ci` runs in Dockerfile.

### Deployment Fails: "Permission denied"

**Solution**: Ensure Cloud Run API is enabled and you have necessary permissions:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/run.admin"
```

### Service Returns 500 Errors

**Solution**: Check logs:
```bash
gcloud run services logs read api-server --region us-central1
```

Common issues:
- Missing environment variables
- Invalid Supabase credentials
- Database connection issues

### CORS Errors

**Solution**: Verify `ALLOWED_ORIGINS` includes your frontend domain:
```bash
gcloud run services update api-server \
  --region us-central1 \
  --update-env-vars ALLOWED_ORIGINS=https://your-domain.com,https://admin.your-domain.com
```

## Cost Optimization

1. **Set min-instances to 0** - Scales to zero when idle (saves costs)
2. **Use appropriate memory/CPU** - Don't over-provision
3. **Set max-instances** - Prevent runaway costs
4. **Monitor usage** - Use Cloud Monitoring to track costs

## Security Best Practices

1. ✅ **Use Secret Manager** for sensitive credentials
2. ✅ **Enable authentication** if API should be private
3. ✅ **Use VPC connector** for private database access
4. ✅ **Enable Cloud Armor** for DDoS protection
5. ✅ **Regular security updates** - Keep dependencies updated
6. ✅ **Monitor logs** for suspicious activity

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy API Server

on:
  push:
    branches: [main]
    paths:
      - 'packages/api-server/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Build and Deploy
        run: |
          cd packages/api-server
          gcloud builds submit --config=cloudbuild.yaml
```

## Rollback

If deployment fails or issues occur:

```bash
# List revisions
gcloud run revisions list --service api-server --region us-central1

# Rollback to previous revision
gcloud run services update-traffic api-server \
  --region us-central1 \
  --to-revisions PREVIOUS_REVISION=100
```

## Next Steps

1. ✅ Deploy API server (this guide)
2. ✅ Update frontend apps with API URL
3. ✅ Test all endpoints
4. ✅ Set up monitoring and alerts
5. ✅ Configure custom domain
6. ✅ Set up CI/CD pipeline

## Support

For issues or questions:
- Check Cloud Run logs
- Review [Cloud Run documentation](https://cloud.google.com/run/docs)
- Check API server logs: `gcloud run services logs read api-server`

