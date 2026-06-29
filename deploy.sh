#!/bin/bash
# Deploy to Google Cloud Run
# Requires: gcloud CLI, GEMINI_API_KEY env var, authenticated gcloud session

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-vibe-hackathon-2026}"
SERVICE_NAME="deadline-rescue"
REGION="us-central1"

echo "🚀 Deploying Deadline Rescue Agent to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Build and deploy in one command
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_API_KEY=$GOOGLE_API_KEY,GEMINI_API_KEY=$GEMINI_API_KEY" \
  --memory "512Mi" \
  --cpu "1" \
  --min-instances "0" \
  --max-instances "1" \
  --concurrency "80"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application URL: $SERVICE_URL"
echo "📊 Health check: $SERVICE_URL/health"
echo ""
echo "Submit this URL to the hackathon portal."