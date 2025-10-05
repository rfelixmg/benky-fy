#!/bin/bash

# Benky-Fy GCP Deployment Script
# This script builds and deploys both frontend and backend to GCP Cloud Run

set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"your-project-id"}
REGION=${GCP_REGION:-"us-central1"}
BACKEND_SERVICE="benky-fy-backend"
FRONTEND_SERVICE="benky-fy-frontend"

echo "🚀 Starting Benky-Fy GCP Deployment..."

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install and authenticate."
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

echo "📦 Building backend Docker image..."
# Build and push backend
docker build -f Dockerfile.backend -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest .
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest

echo "📦 Building frontend Docker image..."
# Build and push frontend
cd frontend-nextjs
docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest .
docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest
cd ..

echo "🚀 Deploying backend to Cloud Run..."
# Deploy backend
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

echo "🚀 Deploying frontend to Cloud Run..."
# Deploy frontend with backend URL
gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --set-env-vars NEXT_PUBLIC_API_URL=$BACKEND_URL

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo "🎉 Deployment complete!"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
