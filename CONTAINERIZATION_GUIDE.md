# Benky-Fy Containerization & GCP Deployment Guide

## 🚀 Overview

This guide covers containerizing both frontend (Next.js) and backend (Flask) applications for deployment on Google Cloud Platform (GCP) Cloud Run.

## 📁 Files Created

### Docker Configuration
- `Dockerfile.frontend` - Next.js frontend container
- `Dockerfile.backend` - Flask backend container
- `docker-compose.yml` - Local development setup

### GCP Deployment
- `gcp-backend.yaml` - Backend Cloud Run configuration
- `gcp-frontend.yaml` - Frontend Cloud Run configuration
- `deploy-gcp.sh` - Automated deployment script

### Environment Configuration
- `src/lib/api-utils.ts` - API utility with environment variable support

## 🔧 Environment Variables

### Frontend (Next.js)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Port number (default: 3000)

### Backend (Flask)
- `FLASK_ENV` - Environment (development/production)
- `PORT` - Port number (default: 8080)

## 🐳 Local Development

### Using Docker Compose
```bash
# Start both services
docker-compose up --build

# Access applications
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

### Individual Services
```bash
# Backend only
docker build -f Dockerfile.backend -t benky-fy-backend .
docker run -p 8080:8080 benky-fy-backend

# Frontend only
cd frontend-nextjs
docker build -f Dockerfile.frontend -t benky-fy-frontend .
docker run -p 3000:3000 benky-fy-frontend
```

## ☁️ GCP Cloud Run Deployment

### Prerequisites
1. Install `gcloud` CLI
2. Authenticate: `gcloud auth login`
3. Set project: `gcloud config set project YOUR_PROJECT_ID`

### Automated Deployment
```bash
# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"

# Run deployment script
./deploy-gcp.sh
```

### Manual Deployment
```bash
# Build and push images
docker build -f Dockerfile.backend -t gcr.io/PROJECT_ID/benky-fy-backend:latest .
docker push gcr.io/PROJECT_ID/benky-fy-backend:latest

# Deploy backend
gcloud run deploy benky-fy-backend \
    --image gcr.io/PROJECT_ID/benky-fy-backend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

# Deploy frontend (update API URL)
gcloud run deploy benky-fy-frontend \
    --image gcr.io/PROJECT_ID/benky-fy-frontend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars NEXT_PUBLIC_API_URL=https://backend-url
```

## 🔄 API Configuration

The frontend now uses environment variables for API configuration:

```typescript
// src/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// src/lib/api-utils.ts
export async function fetchFromBackend(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  // ... fetch logic
}
```

## 🏥 Health Checks

Both services include health check endpoints:
- Backend: `GET /health`
- Frontend: `GET /`

## 📊 Resource Limits

### Backend (Cloud Run)
- CPU: 1 vCPU
- Memory: 512Mi
- Port: 8080

### Frontend (Cloud Run)
- CPU: 1 vCPU
- Memory: 1Gi
- Port: 3000

## 🚨 Troubleshooting

### Common Issues
1. **API Connection Failed**: Check `NEXT_PUBLIC_API_URL` environment variable
2. **Build Failures**: Ensure all dependencies are in requirements.txt/package.json
3. **Port Conflicts**: Verify ports 3000 and 8080 are available

### Debug Commands
```bash
# Check container logs
docker logs <container_id>

# Check Cloud Run logs
gcloud logs read --service=benky-fy-backend
gcloud logs read --service=benky-fy-frontend

# Test API connectivity
curl http://localhost:8080/health
curl http://localhost:3000
```

## ✅ Success Criteria

- [ ] Both services containerize successfully
- [ ] Local docker-compose setup works
- [ ] GCP deployment completes without errors
- [ ] Frontend can communicate with backend via environment variable
- [ ] Health checks pass
- [ ] Applications accessible via Cloud Run URLs

---

**Created by:** Leonardo Hayes (Frontend Engineer)  
**Date:** Current Sprint  
**Next Review:** After deployment testing
