# Application Architecture Documentation

## Project Structure
```
benky-fy/
├── app/                    # Main application code
│   ├── auth.py             # Authentication system
│   ├── routes.py           # Main routes
│   ├── __init__.py         # App factory
│   ├── flashcard/          # Flashcard modules
│   ├── help/               # Help system
│   ├── conjugation/        # Conjugation system
│   ├── settings/           # Settings management
│   ├── static/             # Static assets
│   └── templates/          # HTML templates
├── test/                   # Test suite
├── doc/                    # Documentation
├── datum/                  # Data files
└── run.py                  # Application entry point
```

## Core Components

### Authentication System (`app/auth.py`)
- **Test Mode**: Environment variable + session context verification
- **Production Mode**: Google OAuth 2.0 integration
- **Session Management**: Flask sessions with automatic clearing
- **Force Production**: `force_prod_mode` parameter for testing

### Flashcard System (`app/flashcard/`)
- **Modular Design**: Separate modules for different content types
- **API Endpoints**: RESTful APIs for data retrieval and validation
- **Settings Management**: User preferences per module
- **Answer Checking**: Comprehensive validation system

### Help System (`app/help/`)
- **Word Information**: Detailed word data with furigana
- **Display Management**: Flexible text rendering
- **Module Integration**: Works with all flashcard modules

### Conjugation System (`app/conjugation/`)
- **Answer Checking**: Comprehensive validation system for verbs and adjectives
- **Modular Design**: Separate checkers for different grammatical types (godan, ichidan, irregular verbs; i-adjective, na-adjective)
- **Result Models**: Structured response data with detailed feedback
- **API Endpoints**: RESTful API for conjugation practice and checking
- **Data Integrity**: Automated conjugation data fixing and validation

### Settings System (`app/settings/`)
- **Plugin Architecture**: Modular settings for different features
- **Registry Pattern**: Centralized settings management
- **Validation**: Input validation and sanitization

## Data Management

### Data Files (`datum/`)
- **JSON Format**: Structured data for all learning modules
- **Modular Content**: Separate files for different content types
- **Validation**: Data integrity checks

### Available Modules
- Hiragana/Katakana: Character learning
- Verbs/Adjectives: Grammar and vocabulary
- Numbers: Basic and extended number systems
- Vocabulary: Greetings, colors, days, months
- Question Words: Essential interrogatives

## Application Factory Pattern

### Flask App Creation (`app/__init__.py`)
- **Blueprint Registration**: Modular route organization
- **Environment Configuration**: Test vs production mode
- **OAuth Setup**: Google OAuth integration
- **Session Configuration**: Secure session management

### Entry Point (`run.py`)
- **Environment Loading**: `.environment` file support
- **Error Handling**: Graceful startup error handling
- **Development Server**: Flask development server configuration

## Security Considerations

### Authentication Security
- **Session-based**: Server-side session storage
- **OAuth Integration**: Secure Google OAuth flow
- **Test Mode Isolation**: Separate test authentication
- **Session Clearing**: Automatic cleanup of invalid sessions

### Data Security
- **No Client-side Secrets**: All sensitive data server-side
- **Input Validation**: Comprehensive parameter validation
- **Error Handling**: Secure error responses
- **CORS Configuration**: Cross-origin support for frontend integration

## Development Workflow

### Testing
- **Comprehensive Test Suite**: Full API and integration testing
- **Test Mode**: Environment variable-based test authentication
- **Mock Data**: Isolated test data and scenarios
- **Debug Endpoints**: Built-in debugging capabilities

### Deployment
- **Docker Support**: Containerized deployment
- **Environment Variables**: Configuration via environment
- **GCP Integration**: Google Cloud Platform deployment
- **Production Security**: OAuth-only authentication in production
