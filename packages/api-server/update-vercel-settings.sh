#!/bin/bash
# Update Vercel project settings for pawpointers-api-server

set -e

echo "🔧 Updating Vercel project settings for pawpointers-api-server..."

# Get project ID
PROJECT_ID="prj_QaCCHVYM3EPQ8RlLm4TwOxSLDM2l"

# Note: Vercel CLI doesn't have a direct command to update project settings
# You need to update them via the dashboard:
# https://vercel.com/tindeveloper/pawpointers-api-server/settings

echo ""
echo "⚠️  Vercel CLI doesn't support updating project settings directly."
echo ""
echo "Please update these settings manually in the Vercel Dashboard:"
echo "👉 https://vercel.com/tindeveloper/pawpointers-api-server/settings"
echo ""
echo "Required Settings:"
echo "  - Root Directory: packages/api-server"
echo "  - Build Command: cd ../.. && pnpm turbo build --filter=@listing-platform/api-server"
echo "  - Output Directory: . (or leave empty)"
echo "  - Install Command: cd ../.. && pnpm install --frozen-lockfile"
echo ""
echo "After updating, deploy with:"
echo "  cd packages/api-server && vercel --prod"

