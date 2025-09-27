# Benky-Fy API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the Benky-Fy application. The API supports both authenticated and unauthenticated requests, with special handling for test mode via environment variables.

## Authentication
- **Test Mode**: Set `BENKY_FY_TEST_HASH` environment variable to enable test mode
- **Production Mode**: Requires Google OAuth authentication
- **Session-based**: Uses Flask sessions for user state management

## Base URLs
- **Development**: `http://localhost:8081`
- **Production**: `https://your-domain.com`

---

## Main Routes (`/`)

### GET `/`
**Description**: Public landing page  
**Authentication**: None required  
**Response**: HTML page

### GET `/home`
**Description**: Private dashboard after login  
**Authentication**: Required  
**Response**: HTML page with user greeting

### GET `/modules`
**Description**: Available learning modules page  
**Authentication**: Required  
**Response**: HTML page with module list

### GET `/profile`
**Description**: User profile page  
**Authentication**: Required  
**Response**: HTML page with profile data

### GET `/begginer`
**Description**: Flashcard modules overview  
**Authentication**: Required  
**Response**: HTML page with flashcard modules

---

## Authentication Routes (`/auth`)

### GET `/auth/login`
**Description**: Login route that handles OAuth flow  
**Authentication**: None required  
**Response**: Redirects to Google OAuth or home if already logged in

### GET `/auth/post-login`
**Description**: Legacy OAuth callback route  
**Authentication**: None required  
**Response**: Redirects to home

### GET `/auth/logout`
**Description**: Logout user and clear session  
**Authentication**: None required  
**Response**: Redirects to landing page

### GET `/auth/profile`
**Description**: User profile page with dummy data  
**Authentication**: Required  
**Response**: HTML page with profile information

### GET `/auth/dashboard`
**Description**: User dashboard with progress data  
**Authentication**: Required  
**Response**: HTML page with dashboard data

### GET `/auth/settings`
**Description**: User settings page  
**Authentication**: Required  
**Response**: HTML page with settings options

### GET `/auth/check-auth`
**Description**: API endpoint to check authentication status  
**Authentication**: None required  
**Response**: JSON with authentication status

**Response Format**:
```json
{
  "authenticated": true,
  "user": {
    "name": "User Name",
    "email": "user@example.com",
    "picture": "https://..."
  },
  "session_keys": ["user", "next_url"],
  "google_authorized": true
}
```

### GET `/auth/debug-oauth`
**Description**: Debug endpoint for OAuth configuration  
**Authentication**: None required  
**Response**: JSON with OAuth debug information

---

## Help API Routes (`/help`)

### GET `/help/api/word-info`
**Description**: Get detailed word information for help modal  
**Authentication**: Required  
**Parameters**:
- `module_name` (string, required): Name of the learning module
- `item_id` (string, required): ID of the flashcard item (1-based)

**Response Format**:
```json
{
  "success": true,
  "word_info": {
    "kanji": "漢字",
    "hiragana": "ひらがな",
    "english": "English meaning",
    "furigana_html": "<ruby>漢字<rt>ふりがな</rt></ruby>"
  },
  "display_info": {
    "kanji": {
      "label": "Kanji",
      "value": "漢字",
      "visible": true,
      "class": "kanji"
    }
  },
  "message": "Word information retrieved successfully"
}
```

**Error Responses**:
- `400`: Missing required parameters
- `404`: Module not found
- `500`: Server error

---

## Flashcard Module Routes (`/begginer/{module}`)

Each learning module (hiragana, katakana, verbs, adjectives, etc.) has the following routes:

### GET `/begginer/{module}/`
**Description**: Main flashcard interface  
**Authentication**: Required  
**Response**: HTML page with flashcard and settings

### POST `/begginer/{module}/settings`
**Description**: Update user settings for the module  
**Authentication**: Required  
**Request Body**: Form data with settings
**Response**: JSON with success status

### POST `/begginer/{module}/check`
**Description**: Check user answers against correct answers  
**Authentication**: Required  
**Request Body**: Form data with user inputs
**Response**: HTML page with results

### GET `/begginer/{module}/api/correct-answers`
**Description**: Get correct answers for a specific item  
**Authentication**: Required  
**Parameters**:
- `item_id` (string, required): ID of the flashcard item (1-based)

**Response Format**:
```json
{
  "user_hiragana": "ひらがな",
  "user_romaji": "romaji",
  "user_kanji": "漢字",
  "user_english": "English meaning"
}
```

### GET `/begginer/{module}/api/display-text`
**Description**: Get display text for an item based on settings  
**Authentication**: Required  
**Parameters**:
- `item_id` (string, required): ID of the flashcard item (1-based)
- `display_mode` (string, optional): Display mode setting
- `kana_type` (string, optional): Kana type setting
- `furigana_style` (string, optional): Furigana style setting
- `proportions.*` (float, optional): Various proportion settings

**Response Format**:
```json
{
  "text": "Display text",
  "script": "Script type",
  "mode": "Display mode",
  "fallback_used": false
}
```

### GET `/begginer/{module}/api/dataset-info`
**Description**: Get dataset information including size  
**Authentication**: None required  
**Response Format**:
```json
{
  "total_items": 46,
  "module_name": "verbs",
  "message": "Dataset info retrieved successfully"
}
```

### POST `/begginer/{module}/api/check-answers`
**Description**: API endpoint for checking answers (JSON response)  
**Authentication**: Required  
**Request Body**: Form data with user inputs and settings
**Response Format**:
```json
{
  "results": {
    "user_hiragana": {
      "correct": true,
      "user_input": "ひらがな",
      "correct_answer": "ひらがな"
    }
  },
  "user_inputs": {
    "user_hiragana": "ひらがな"
  },
  "input_modes": ["hiragana", "english"],
  "all_correct": true
}
```

---

## Available Learning Modules

The following modules are available with the above API structure:

- **hiragana**: `/begginer/hiragana`
- **katakana**: `/begginer/katakana`
- **verbs**: `/begginer/verbs`
- **adjectives**: `/begginer/adjectives`
- **numbers-basic**: `/begginer/numbers-basic`
- **numbers-extended**: `/begginer/numbers-extended`
- **days-of-week**: `/begginer/days-of-week`
- **months**: `/begginer/months`
- **colors**: `/begginer/colors`
- **greetings**: `/begginer/greetings`
- **question-words**: `/begginer/question-words`
- **base_nouns**: `/begginer/base_nouns`

---

## Error Handling

### Common Error Responses

**400 Bad Request**:
```json
{
  "error": "Missing required parameter: item_id"
}
```

**404 Not Found**:
```json
{
  "error": "Module verbs not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to get word info: Database connection failed"
}
```

### Authentication Errors
- **Unauthenticated**: Redirects to login page
- **Test Mode**: Uses `BENKY_FY_TEST_HASH` environment variable
- **OAuth Errors**: Handled by Flask-Dance with appropriate error messages

---

## Environment Variables

### Required for Production
- `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_OAUTH_CLIENT_SECRET`: Google OAuth client secret
- `FLASK_SECRET_KEY`: Secret key for sessions (optional, defaults to "superkey-benky-fy")

### Required for Testing
- `BENKY_FY_TEST_HASH`: SHA256 hash for test mode authentication


---

## Rate Limiting
Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS
CORS is not explicitly configured. The application is designed for same-origin requests.

## Security Considerations
- All authenticated routes require valid session
- Test mode bypasses OAuth but requires specific environment variable
- Session data is stored server-side
- No API keys or tokens exposed to client-side JavaScript