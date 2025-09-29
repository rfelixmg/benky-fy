# API Endpoints Documentation

## Base URLs
- **Development**: `http://localhost:8080`
- **Production**: `https://your-domain.com`

## API Versioning
All API endpoints are versioned under the `/v1` prefix. For example:
- `/auth/login` becomes `/v1/auth/login`
- `/help/api/word-info` becomes `/v1/help/api/word-info`
- `/begginer/hiragana` becomes `/v1/begginer/hiragana`

This versioning ensures API stability and enables future updates without breaking existing integrations.

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

## Authentication Routes (`/v1/auth`)

### GET `/auth/login`
**Description**: Login route that handles OAuth flow  
**Authentication**: None required  
**Response**: Redirects to Google OAuth or home if already logged in

### GET `/auth/logout`
**Description**: Logout user and clear session  
**Authentication**: None required  
**Response**: Redirects to landing page

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

### GET `/auth/debug-test-mode`
**Description**: Debug endpoint for test mode configuration  
**Authentication**: None required  
**Response**: JSON with test mode debug information

---

## Help API Routes (`/v1/help`)

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

---

## Flashcard Module Routes (`/v1/begginer/{module}`)

### GET `/begginer/{module}/`
**Description**: Main flashcard interface  
**Authentication**: Required  
**Response**: HTML page with flashcard and settings

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

### GET `/begginer/{module}/api/correct-answers`
**Description**: Get correct answers for a specific item  
**Authentication**: Required  
**Parameters**:
- `item_id` (string, required): ID of the flashcard item (1-based)

### GET `/begginer/{module}/api/display-text`
**Description**: Get display text for an item based on settings  
**Authentication**: Required  
**Parameters**:
- `item_id` (string, required): ID of the flashcard item (1-based)
- `display_mode` (string, optional): Display mode setting
- `kana_type` (string, optional): Kana type setting
- `furigana_style` (string, optional): Furigana style setting

### POST `/begginer/{module}/api/check-answers`
**Description**: API endpoint for checking answers (JSON response)  
**Authentication**: Required  
**Request Body**: Form data with user inputs and settings

### POST `/begginer/{module}/settings`
**Description**: Update user settings for the module  
**Authentication**: Required  
**Request Body**: Form data with settings

### POST `/begginer/{module}/check`
**Description**: Check user answers against correct answers  
**Authentication**: Required  
**Request Body**: Form data with user inputs

---

## Available Learning Modules

- **hiragana**: `/v1/begginer/hiragana`
- **katakana**: `/v1/begginer/katakana`
- **verbs**: `/v1/begginer/verbs`
- **adjectives**: `/v1/begginer/adjectives`
- **numbers-basic**: `/v1/begginer/numbers-basic`
- **numbers-extended**: `/v1/begginer/numbers-extended`
- **days-of-week**: `/v1/begginer/days-of-week`
- **months**: `/v1/begginer/months`
- **colors**: `/v1/begginer/colors`
- **greetings**: `/v1/begginer/greetings`
- **question-words**: `/v1/begginer/question-words`
- **base_nouns**: `/v1/begginer/base_nouns`

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
