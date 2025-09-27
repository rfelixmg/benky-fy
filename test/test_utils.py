"""
Test utilities and helpers for modular testing.

This module provides reusable fixtures and helper functions for testing.
"""

import pytest
import os
from unittest.mock import patch
from flask import Flask
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from test_config import (
    TEST_HASH, TEST_USER, TEST_DUMMY_CONTEXT, 
    AUTHENTICATED_ENDPOINTS, PUBLIC_ENDPOINTS
)


class TestClientFactory:
    """Factory class for creating different types of test clients."""
    
    @staticmethod
    def create_test_mode_client():
        """Create client with test mode enabled (both env var AND dummy context)."""
        os.environ['BENKY_FY_TEST_HASH'] = TEST_HASH
        app = create_app()
        client = app.test_client()
        # Set up test user session AND dummy context
        with client.session_transaction() as sess:
            sess['user'] = TEST_USER
            sess['test_dummy_context'] = TEST_DUMMY_CONTEXT
        return client
    
    @staticmethod
    def create_env_var_only_client():
        """Create client with only environment variable (no dummy context)."""
        os.environ['BENKY_FY_TEST_HASH'] = TEST_HASH
        app = create_app()
        client = app.test_client()
        # Set up test user session but NO dummy context
        with client.session_transaction() as sess:
            sess['user'] = TEST_USER
            # Intentionally NOT setting test_dummy_context
        return client
    
    @staticmethod
    def create_dummy_context_only_client():
        """Create client with only dummy context (no env var)."""
        # Explicitly remove the test hash environment variable
        if 'BENKY_FY_TEST_HASH' in os.environ:
            del os.environ['BENKY_FY_TEST_HASH']
        
        with patch.dict(os.environ, {
            'GOOGLE_OAUTH_CLIENT_ID': 'dummy_client_id',
            'GOOGLE_OAUTH_CLIENT_SECRET': 'dummy_client_secret'
        }, clear=True):
            app = create_app()
            client = app.test_client()
            # Set up dummy context but NO environment variable
            with client.session_transaction() as sess:
                sess['user'] = TEST_USER
                sess['test_dummy_context'] = TEST_DUMMY_CONTEXT
            return client
    
    @staticmethod
    def create_production_client():
        """Create client without test mode (production mode)."""
        # Explicitly remove the test hash environment variable
        if 'BENKY_FY_TEST_HASH' in os.environ:
            del os.environ['BENKY_FY_TEST_HASH']
        
        with patch.dict(os.environ, {
            'GOOGLE_OAUTH_CLIENT_ID': 'dummy_client_id',
            'GOOGLE_OAUTH_CLIENT_SECRET': 'dummy_client_secret'
        }, clear=True):
            app = create_app()
            return app.test_client()
    
    @staticmethod
    def create_basic_client():
        """Create basic client with test hash but no session setup."""
        with patch.dict(os.environ, {'BENKY_FY_TEST_HASH': TEST_HASH}):
            app = create_app()
            return app.test_client()


class TestAssertions:
    """Helper class with common test assertions."""
    
    @staticmethod
    def assert_redirects_to_login(response):
        """Assert that response redirects to login page."""
        assert response.status_code == 302
        assert '/auth/login' in response.location
    
    @staticmethod
    def assert_successful_response(response, expected_status=200):
        """Assert that response is successful."""
        assert response.status_code == expected_status
    
    @staticmethod
    def assert_contains_content(response, *content_items):
        """Assert that response contains specified content."""
        for content in content_items:
            assert content.encode() in response.data
    
    @staticmethod
    def assert_json_response(response, expected_status=200):
        """Assert that response is valid JSON."""
        assert response.status_code == expected_status
        assert response.content_type == 'application/json'


class TestFixtures:
    """Pytest fixtures for common test scenarios."""
    
    @pytest.fixture
    def test_hash(self):
        """Generate test hash for test mode."""
        return TEST_HASH
    
    @pytest.fixture
    def app(self, test_hash):
        """Create Flask app for testing with test mode enabled."""
        with patch.dict(os.environ, {'BENKY_FY_TEST_HASH': test_hash}):
            return create_app()
    
    @pytest.fixture
    def client(self, app):
        """Create test client."""
        return app.test_client()
    
    @pytest.fixture
    def test_mode_client(self):
        """Create client with test mode enabled (both env var AND dummy context)."""
        return TestClientFactory.create_test_mode_client()
    
    @pytest.fixture
    def env_var_only_client(self):
        """Create client with only environment variable (no dummy context)."""
        return TestClientFactory.create_env_var_only_client()
    
    @pytest.fixture
    def dummy_context_only_client(self):
        """Create client with only dummy context (no env var)."""
        return TestClientFactory.create_dummy_context_only_client()
    
    @pytest.fixture
    def production_mode_client(self):
        """Create client without test mode (production mode)."""
        return TestClientFactory.create_production_client()


class TestDataProvider:
    """Provider class for test data."""
    
    @staticmethod
    def get_test_endpoints():
        """Get all test endpoints."""
        return {
            'authenticated': AUTHENTICATED_ENDPOINTS,
            'public': PUBLIC_ENDPOINTS
        }
    
    @staticmethod
    def get_test_modules():
        """Get test modules configuration."""
        from test_config import TEST_MODULES, HELP_API_MODULES
        return {
            'flashcard_modules': TEST_MODULES,
            'help_modules': HELP_API_MODULES
        }
    
    @staticmethod
    def get_test_user_data():
        """Get test user data."""
        return TEST_USER
    
    @staticmethod
    def get_dummy_context():
        """Get dummy context data."""
        return TEST_DUMMY_CONTEXT
