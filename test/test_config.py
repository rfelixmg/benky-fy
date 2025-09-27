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
    "picture": "https://via.placeholder.com/150/4285f4/ffffff?text=T",
    "is_test_user": True
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
    '/help/api/word-info?module_name=verbs&item_id=1',
    '/begginer/verbs/',
    '/begginer/verbs/api/correct-answers?item_id=1',
    '/begginer/verbs/api/display-text?item_id=1',
    '/begginer/verbs/api/check-answers',
    '/begginer/verbs/settings',
    '/begginer/verbs/check'
]

PUBLIC_ENDPOINTS = [
    '/',
    '/auth/login',
    '/auth/logout',
    '/auth/check-auth',
    '/auth/debug-oauth',
    '/begginer/verbs/api/dataset-info'
]
