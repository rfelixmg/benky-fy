# Benky-Fy Test Suite

This directory contains a comprehensive, modular test suite for the Benky-Fy application with dual verification system.

## Test Structure

### Core Files
- `test_config.py` - Test configuration and constants
- `test_utils.py` - Reusable test utilities, fixtures, and helper classes
- `run_tests.py` - Test runner script

### Test Modules
- `test_main_routes.py` - Tests for main application routes and dual verification
- `test_flashcard_api.py` - Tests for flashcard API endpoints
- `test_help_api.py` - Tests for help API endpoints  
- `test_environment_scenarios.py` - Tests for environment variable scenarios

## Dual Verification System

The test suite implements a dual verification system that requires **both**:
1. `BENKY_FY_TEST_HASH` environment variable
2. `test_dummy_context` in session

### Test Client Types

The `TestClientFactory` provides different client configurations:

- `create_test_mode_client()` - Both env var + dummy context (✅ works)
- `create_env_var_only_client()` - Only env var (❌ fails)
- `create_dummy_context_only_client()` - Only dummy context (❌ fails)
- `create_production_client()` - Neither condition (❌ fails)

## Running Tests

### Run All Tests
```bash
python test/run_tests.py
```

### Run Specific Test Module
```bash
python test/run_tests.py --pattern test_main_routes.py
```

### Run with Verbose Output
```bash
python test/run_tests.py --verbose
```

### Run with Coverage
```bash
python test/run_tests.py --coverage
```

### Quick Test (Essential Tests Only)
```bash
python test/run_tests.py --quick
```

### Using pytest directly
```bash
# Run all tests
pytest test/ -v

# Run specific test file
pytest test/test_main_routes.py -v

# Run specific test class
pytest test/test_main_routes.py::TestMainRoutes -v

# Run specific test method
pytest test/test_main_routes.py::TestMainRoutes::test_home_with_test_auth_success -v
```

## Test Classes

### TestMainRoutes
Tests core routing functionality including authentication scenarios.

### TestDualVerificationSystem  
Tests specifically for the dual verification system.

### TestAuthenticationScenarios
Tests various authentication scenarios and session persistence.

### TestFlashcardAPI
Tests flashcard API endpoints including data validation.

### TestFlashcardDualVerification
Tests flashcard API dual verification system.

### TestFlashcardDataValidation
Tests flashcard data validation and error handling.

### TestHelpAPI
Tests help API endpoints including parameter validation.

### TestHelpAPIDualVerification
Tests help API dual verification system.

### TestHelpAPIDataValidation
Tests help API data validation and error handling.

### TestEnvironmentVariableScenarios
Tests environment variable scenarios and edge cases.

### TestDualVerificationScenarios
Tests specifically for dual verification scenarios.

### TestEnvironmentVariableEdgeCases
Tests edge cases in environment variable handling.

### TestSessionContextEdgeCases
Tests edge cases in session context handling.

### TestCrossEndpointConsistency
Tests consistency across different endpoint types.

## Test Utilities

### TestClientFactory
Factory class for creating different types of test clients.

### TestAssertions
Helper class with common test assertions:
- `assert_redirects_to_login()`
- `assert_successful_response()`
- `assert_contains_content()`
- `assert_json_response()`

### TestFixtures
Pytest fixtures for common test scenarios.

### TestDataProvider
Provider class for test data and configurations.

## Configuration

Test configuration is centralized in `test_config.py`:
- `TEST_HASH` - Test mode hash
- `TEST_USER` - Test user data
- `TEST_DUMMY_CONTEXT` - Dummy context for modules
- `TEST_MODULES` - Available test modules
- `AUTHENTICATED_ENDPOINTS` - Endpoints requiring authentication
- `PUBLIC_ENDPOINTS` - Publicly accessible endpoints

## Security

The dual verification system ensures that:
- Test mode only works when both conditions are explicitly met
- No accidental bypass of Google OAuth authentication
- Proper fallback to production authentication when test conditions not met

## Best Practices

1. **Modular Design** - Tests are organized into logical modules
2. **Reusable Components** - Common functionality is abstracted into utilities
3. **Comprehensive Coverage** - Tests cover success, failure, and edge cases
4. **Clear Naming** - Test names clearly describe what is being tested
5. **Consistent Structure** - All test classes follow similar patterns
6. **Documentation** - Each test class and method is well documented
