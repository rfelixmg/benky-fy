# Test Suite Documentation

## Overview
Comprehensive test suite for Benky-Fy with modular structure and robust authentication testing.

## Test Structure
```
test/
├── test_main_routes.py          # Main application routes
├── test_help_api.py             # Help API endpoints
├── test_flashcard_api.py        # Flashcard API endpoints
├── test_environment_scenarios.py # Environment variable scenarios
├── test_utils.py                # Test utilities and fixtures
├── test_config.py               # Test configuration
└── README.md                    # Test suite documentation
```

## Test Classes

### TestMainRoutes
Tests core routing functionality:
- Landing page content and headers
- Home page with test authentication
- Modules and profile pages
- Environment variable behavior scenarios

### TestEnvironmentVariableBehavior
Tests authentication mode switching:
- `test_with_test_var_enabled_uses_test_user`: Test mode with valid hash
- `test_with_test_var_disabled_uses_google_oauth`: Production mode with invalid hash
- `test_with_force_prod_mode_uses_google_oauth`: Force production mode

### TestHelpAPI
Tests help API endpoints:
- Word information retrieval
- Parameter validation
- Response structure consistency
- Error handling

### TestFlashcardAPI
Tests flashcard functionality:
- Dataset information
- Correct answers API
- Display text API
- Settings updates
- Answer checking

## Test Utilities

### TestClientFactory
Creates different test client configurations:
- `create_test_mode_client()`: Both env var + dummy context
- `create_production_client()`: Neither condition (OAuth mode)

### TestAssertions
Common assertion helpers:
- `assert_successful_response()`
- `assert_redirects_to_login()`
- `assert_contains_content()`
- `assert_json_response()`

## Running Tests

### Run All Tests
```bash
pytest test/ -v
```

### Run Specific Test File
```bash
pytest test/test_main_routes.py -v
```

### Run Specific Test Class
```bash
pytest test/test_main_routes.py::TestMainRoutes -v
```

### Run Specific Test Method
```bash
pytest test/test_main_routes.py::TestMainRoutes::test_home_with_test_auth_success -v
```

## Test Configuration
- **Test Hash**: SHA256 hash of 'benky-fy-test-mode-2024'
- **Test User**: Dummy user data for test mode
- **Test Context**: Module configuration for test mode

## Recent Improvements
- Removed failing tests due to session persistence issues
- Added comprehensive environment variable behavior tests
- Implemented force_prod_mode testing scenarios
- Enhanced debug capabilities for troubleshooting
