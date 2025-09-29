"""
Test configuration file.

This file contains test-specific settings and should NOT be committed to GitHub.
Add this file to .gitignore to keep test secrets secure.
"""

import hashlib

# Test mode configuration
TEST_MODE_SECRET = b'benky-fy-test-mode-2024'
TEST_HASH = hashlib.sha256(TEST_MODE_SECRET).hexdigest()

# Test user data
TEST_USER = {
    "name": "Test User",
    "email": "test@benky-fy.com",
    "picture": "",
    "is_test_user": True
}

# Test dummy context for modules
TEST_DUMMY_CONTEXT = {
    "test_modules": {
        "hiragana": {"enabled": True, "data_source": "test"},
        "katakana": {"enabled": True, "data_source": "test"},
        "verbs": {"enabled": True, "data_source": "test"},
        "adjectives": {"enabled": True, "data_source": "test"},
        "numbers_basic": {"enabled": True, "data_source": "test"},
        "vocab": {"enabled": True, "data_source": "test"}
    },
    "test_user_context": {
        "session_id": "test_session_12345",
        "test_mode": True,
        "bypass_oauth": True
    }
}

# Test modules to verify (using correct URL prefixes for flashcard API)
TEST_MODULES = ['hiragana', 'katakana', 'verbs', 'adjectives', 'numbers-basic']

# Test modules for help API (using internal module names)
HELP_API_MODULES = ['hiragana', 'katakana', 'verbs', 'adjectives', 'numbers_basic']

# Test endpoints
AUTHENTICATED_ENDPOINTS = [
    '/home',
    '/modules',
    '/profile',
    '/v1/help/api/word-info?module_name=verbs&item_id=1',
    '/v1/begginer/verbs/',
    '/v1/begginer/verbs/api/correct-answers?item_id=1',
    '/v1/begginer/verbs/api/display-text?item_id=1',
    '/v1/begginer/verbs/api/check-answers',
    '/v1/begginer/verbs/settings',
    '/v1/begginer/verbs/check'
]

PUBLIC_ENDPOINTS = [
    '/',
    '/v1/auth/login',
    '/v1/auth/logout',
    '/v1/auth/check-auth',
    '/v1/auth/debug-oauth',
    '/v1/begginer/verbs/api/dataset-info'
]

# Test data constants
TEST_ITEM_ID = 1
TEST_INVALID_ITEM_ID = 9999
TEST_MODULE_NAME = 'verbs'
TEST_INVALID_MODULE_NAME = 'nonexistent'
