"""
Test suite for Help API endpoints.

Tests the word information API including:
- Authentication requirements
- Parameter validation
- Data structure consistency
- Error handling
"""

import pytest
import os
import json
from unittest.mock import patch
from flask import Flask
import sys
from test_config import TEST_HASH, TEST_USER, HELP_API_MODULES

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app


class TestHelpAPI:
    """Comprehensive tests for help API endpoints."""
    
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
    def test_mode_client(self, app):
        """Create client with test mode enabled."""
        client = app.test_client()
        # Set up test user session
        with client.session_transaction() as sess:
            sess['user'] = TEST_USER
        return client
    
    def test_word_info_without_auth_redirects(self, client):
        """Test word info endpoint without authentication redirects."""
        response = client.get('/help/api/word-info?module_name=verbs&item_id=1', follow_redirects=False)
        assert response.status_code == 302
        assert '/auth/login' in response.location
    
    def test_word_info_with_test_auth_success(self, test_mode_client):
        """Test word info endpoint with test authentication returns proper data."""
        response = test_mode_client.get('/help/api/word-info?module_name=verbs&item_id=1')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'word_info' in data
        assert 'display_info' in data
        assert 'message' in data
        
        # Check word_info structure
        word_info = data['word_info']
        assert isinstance(word_info, dict)
        
        # Check display_info structure
        display_info = data['display_info']
        assert isinstance(display_info, dict)
    
    def test_word_info_missing_module_name(self, test_mode_client):
        """Test word info endpoint with missing module_name parameter."""
        response = test_mode_client.get('/help/api/word-info?item_id=1')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'module_name' in data['error']
        assert 'required' in data['error']
    
    def test_word_info_missing_item_id(self, test_mode_client):
        """Test word info endpoint with missing item_id parameter."""
        response = test_mode_client.get('/help/api/word-info?module_name=verbs')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'item_id' in data['error']
        assert 'required' in data['error']
    
    def test_word_info_missing_both_params(self, test_mode_client):
        """Test word info endpoint with both parameters missing."""
        response = test_mode_client.get('/help/api/word-info')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'required' in data['error']
    
    def test_word_info_invalid_module_name(self, test_mode_client):
        """Test word info endpoint with invalid module name."""
        response = test_mode_client.get('/help/api/word-info?module_name=nonexistent&item_id=1')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'not found' in data['error']
    
    def test_word_info_invalid_item_id_string(self, test_mode_client):
        """Test word info endpoint with invalid item ID (string)."""
        response = test_mode_client.get('/help/api/word-info?module_name=verbs&item_id=invalid')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_word_info_invalid_item_id_out_of_range(self, test_mode_client):
        """Test word info endpoint with item ID out of range."""
        response = test_mode_client.get('/help/api/word-info?module_name=verbs&item_id=9999')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_word_info_all_modules(self, test_mode_client):
        """Test word info endpoint with all available modules."""
        for module in HELP_API_MODULES:
            response = test_mode_client.get(f'/help/api/word-info?module_name={module}&item_id=1')
            assert response.status_code == 200, f"Failed for module: {module}"
            data = json.loads(response.data)
            assert data['success'] == True, f"Success false for module: {module}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
