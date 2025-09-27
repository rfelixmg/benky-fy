# Authentication System Documentation

## Overview
The Benky-Fy authentication system supports both test mode and production OAuth authentication with robust session management.

## Test Mode Authentication
- **Environment Variable**: `BENKY_FY_TEST_HASH` (SHA256 hash)
- **Session Context**: `test_dummy_context` in session
- **Auto-login**: Automatically logs in as "Test User" when conditions are met

## Production Authentication
- **OAuth Provider**: Google OAuth 2.0 via Flask-Dance
- **Session-based**: Uses Flask sessions for user state
- **Redirects**: Unauthenticated users redirected to `/auth/login`

## Force Production Mode
New parameter `force_prod_mode=True` in `is_test_mode()` function:
- Bypasses test mode detection entirely
- Forces OAuth authentication even with test variables set
- Useful for testing production OAuth flow

## Session Management
- **Automatic Clearing**: Invalid test users cleared when not in test mode
- **Persistence**: Sessions persist across requests
- **Security**: Test users isolated from production authentication

## Debug Endpoints
- `/auth/debug-oauth`: OAuth configuration debug info
- `/auth/debug-test-mode`: Test mode configuration debug info
- `/auth/check-auth`: Authentication status API

## Environment Variables
```bash
# Required for production
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret

# Required for test mode
BENKY_FY_TEST_HASH=sha256_hash_of_secret

# Optional
FLASK_SECRET_KEY=your_secret_key
```
