#!/bin/bash

# Kill background processes on script exit
trap 'kill $(jobs -p)' EXIT

# Start Flask backend
echo "Starting Flask backend..."
cd "$(dirname "$0")"
FLASK_APP=app FLASK_ENV=development BENKY_FY_TEST_HASH=$(echo -n "benky-fy-test-mode-2024" | shasum -a 256 | cut -d' ' -f1) python -m flask run --port 5000 &

# Start Next.js frontend
echo "Starting Next.js frontend..."
cd frontend
npm run dev &

# Wait for both processes
wait
