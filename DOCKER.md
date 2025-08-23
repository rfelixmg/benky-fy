# Docker Deployment Guide

## Prerequisites
- Docker installed on your system
- Google OAuth credentials (Client ID and Client Secret) - **Only for production**

## ⚠️ Security Note
- **NEVER commit your .env file to version control**
- **NEVER share your actual OAuth credentials**
- The `values.env` file in this project is for reference only and contains placeholder values
- Always create a new `.env` file with your real credentials

## Development vs Production

### Development Version (No OAuth Required)
For testing and development without setting up OAuth:

```bash
# Make script executable (first time only)
chmod +x run-docker-dev.sh

# Run development container
./run-docker-dev.sh
```

**Features:**
- No environment variables required
- Flask debug mode enabled
- Volume mounts for live code changes
- OAuth functionality disabled (will show errors for login)

### Production Version (OAuth Required)
For production deployment with full OAuth functionality:

## Quick Start

1. **Create a new .env file** with your Google OAuth credentials:
   ```bash
   # Create .env file (this will be ignored by git)
   touch .env
   ```

2. **Edit .env file** with your actual Google OAuth credentials:
   ```bash
   GOOGLE_OAUTH_CLIENT_ID=your-actual-client-id
   GOOGLE_OAUTH_CLIENT_SECRET=your-actual-client-secret
   FLASK_SECRET_KEY=your-secret-key
   ```

3. **Use Docker Desktop or run Docker commands manually** (see Manual Commands below)

## Docker Desktop Instructions

### Using Docker Desktop GUI:
1. **Build Images:**
   - Open Docker Desktop
   - Go to "Images" tab
   - Click "Build" and select your project directory
   - For development: Use `Dockerfile.dev` and tag as `benky-fy:dev`
   - For production: Use `Dockerfile` and tag as `benky-fy`

2. **Run Containers:**
   - Go to "Containers" tab
   - Click "Run" on your image
   - Set port mapping: `8080:8080`
   - **For Production:** Add environment variables in the "Advanced options" → "Environment variables" section:
     - `FLASK_SECRET_KEY=your-secret-key`
     - `GOOGLE_OAUTH_CLIENT_ID=your-client-id`
     - `GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret`
   - **For Development:** No environment variables needed
   - Click "Run"

### Manual Docker Commands (Terminal):
If you prefer to run Docker commands manually:

### Development Build (No OAuth):
```bash
docker build -f Dockerfile.dev -t benky-fy:dev .
docker run -d \
  --name benky-fy-dev \
  -p 8080:8080 \
  -v "$(pwd)/datum:/app/datum:ro" \
  -v "$(pwd)/app:/app/app:ro" \
  -v "$(pwd)/templates:/app/templates:ro" \
  -v "$(pwd)/static:/app/static:ro" \
  benky-fy:dev
```

### Production Build (OAuth Required):
```bash
docker build -t benky-fy .
```

### Run the container:
```bash
docker run -d \
  --name benky-fy-app \
  -p 8080:8080 \
  -e GOOGLE_OAUTH_CLIENT_ID="your-client-id" \
  -e GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret" \
  -e FLASK_SECRET_KEY="your-secret-key" \
  -v "$(pwd)/datum:/app/datum:ro" \
  benky-fy
```

## Environment Variables

### For Production (OAuth Required):
| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_OAUTH_CLIENT_ID` | Yes | Your Google OAuth Client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Yes | Your Google OAuth Client Secret |
| `FLASK_SECRET_KEY` | No | Flask secret key (defaults to "superkey-benky-fy") |

### For Development (No OAuth):
- No environment variables required
- Uses default development settings

## Useful Commands

- **View logs:** `docker logs benky-fy-app`
- **Stop container:** `docker stop benky-fy-app`
- **Remove container:** `docker rm benky-fy-app`
- **Restart container:** `docker restart benky-fy-app`

## Access the Application

Once running, your application will be available at:
- **URL:** http://localhost:8080
- **Port:** 8080

## Troubleshooting

1. **Port already in use:** Make sure port 8080 is available or change the port mapping
2. **Environment variables missing:** Check that your .env file exists and has the required variables
3. **Build errors:** Ensure Docker is running and you have sufficient disk space
4. **Gunicorn worker boot failure:** 
   - Check if required environment variables are set
   - Try running the development version first: `docker build -f Dockerfile.dev -t benky-fy:dev .`
   - Test app locally: `python test-app.py`
5. **App import errors:** Run `python test-app.py` to check for missing dependencies or configuration issues
