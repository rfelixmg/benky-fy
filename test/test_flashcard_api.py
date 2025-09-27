"""
Test suite for Flashcard API endpoints.

Tests the flashcard functionality including:
- Dataset information
- Correct answers API
- Display text API
- Settings updates
- Answer checking
"""

import pytest
import os
import json
from unittest.mock import patch
from flask import Flask
import sys
from test_config import TEST_HASH, TEST_USER, TEST_MODULES

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app


class TestFlashcardAPI:
    """Comprehensive tests for flashcard API endpoints."""
    
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
    
    def test_flashcard_index_without_auth_redirects(self, client):
        """Test flashcard index without authentication redirects."""
        response = client.get('/begginer/verbs/', follow_redirects=False)
        assert response.status_code == 302
        assert '/auth/login' in response.location
    
    def test_flashcard_index_with_test_auth_success(self, test_mode_client):
        """Test flashcard index with test authentication."""
        response = test_mode_client.get('/begginer/verbs/')
        assert response.status_code == 200
        assert b'flashcard' in response.data.lower()
    
    def test_dataset_info_public_access(self, client):
        """Test dataset info endpoint is publicly accessible."""
        response = client.get('/begginer/verbs/api/dataset-info')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total_items' in data
        assert 'module_name' in data
        assert 'message' in data
        assert data['module_name'] == 'verbs'
        assert isinstance(data['total_items'], int)
        assert data['total_items'] > 0
    
    def test_dataset_info_all_modules(self, client):
        """Test dataset info endpoint for all modules."""
        # Map URL names to internal module names
        module_mapping = {
            'hiragana': 'hiragana',
            'katakana': 'katakana', 
            'verbs': 'verbs',
            'adjectives': 'adjectives',
            'numbers-basic': 'numbers_basic'
        }
        
        for url_module in TEST_MODULES:
            response = client.get(f'/begginer/{url_module}/api/dataset-info')
            assert response.status_code == 200, f"Failed for module: {url_module}"
            data = json.loads(response.data)
            expected_module = module_mapping[url_module]
            assert data['module_name'] == expected_module, f"Wrong module name for: {url_module}"
            assert isinstance(data['total_items'], int), f"Invalid total_items for: {url_module}"
            assert data['total_items'] > 0, f"Empty dataset for: {url_module}"
    
    def test_correct_answers_without_auth_redirects(self, client):
        """Test correct answers endpoint without authentication."""
        response = client.get('/begginer/verbs/api/correct-answers?item_id=1', follow_redirects=False)
        assert response.status_code == 302
        assert '/auth/login' in response.location
    
    def test_correct_answers_with_test_auth_success(self, test_mode_client):
        """Test correct answers endpoint with test authentication."""
        response = test_mode_client.get('/begginer/verbs/api/correct-answers?item_id=1')
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Should contain answer fields
        answer_fields = [key for key in data.keys() if key.startswith('user_')]
        assert len(answer_fields) > 0, "No answer fields found"
        
        # Check for common answer types
        possible_fields = ['user_hiragana', 'user_romaji', 'user_kanji', 'user_english']
        has_valid_field = any(field in data for field in possible_fields)
        assert has_valid_field, "No valid answer fields found"
    
    def test_correct_answers_invalid_item_id(self, test_mode_client):
        """Test correct answers endpoint with invalid item ID."""
        response = test_mode_client.get('/begginer/verbs/api/correct-answers?item_id=9999')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_correct_answers_missing_item_id(self, test_mode_client):
        """Test correct answers endpoint with missing item ID."""
        response = test_mode_client.get('/begginer/verbs/api/correct-answers')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'item_id' in data['error']
    
    def test_display_text_without_auth_redirects(self, client):
        """Test display text endpoint without authentication."""
        response = client.get('/begginer/verbs/api/display-text?item_id=1', follow_redirects=False)
        assert response.status_code == 302
        assert '/auth/login' in response.location
    
    def test_display_text_with_test_auth_success(self, test_mode_client):
        """Test display text endpoint with test authentication."""
        response = test_mode_client.get('/begginer/verbs/api/display-text?item_id=1')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'text' in data
        assert 'script' in data
        assert 'mode' in data
        assert 'fallback_used' in data
        assert isinstance(data['fallback_used'], bool)
    
    def test_display_text_with_parameters(self, test_mode_client):
        """Test display text endpoint with various parameters."""
        params = {
            'item_id': '1',
            'display_mode': 'kanji',
            'kana_type': 'hiragana',
            'furigana_style': 'ruby',
            'proportions.kana': '0.3',
            'proportions.kanji': '0.2',
            'proportions.kanji_furigana': '0.2',
            'proportions.english': '0.3'
        }
        
        response = test_mode_client.get('/begginer/verbs/api/display-text', query_string=params)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'text' in data
        assert 'script' in data
        assert 'mode' in data
    
    def test_check_answers_without_auth_redirects(self, client):
        """Test check answers endpoint without authentication."""
        response = client.post('/begginer/verbs/api/check-answers', data={
            'item_id': '1',
            'user_english': 'test'
        }, follow_redirects=False)
        assert response.status_code == 302
        assert '/auth/login' in response.location
    
    def test_check_answers_with_test_auth_success(self, test_mode_client):
        """Test check answers endpoint with test authentication."""
        response = test_mode_client.post('/begginer/verbs/api/check-answers', data={
            'item_id': '1',
            'user_english': 'test'
        })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'results' in data
        assert 'user_inputs' in data
        assert 'all_correct' in data
        assert isinstance(data['all_correct'], bool)
    
    def test_check_answers_with_input_modes(self, test_mode_client):
        """Test check answers endpoint with input modes."""
        response = test_mode_client.post('/begginer/verbs/api/check-answers', data={
            'item_id': '1',
            'input_modes': 'hiragana,english',
            'user_hiragana': 'test',
            'user_english': 'test'
        })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'results' in data
        assert 'input_modes' in data
        assert 'hiragana' in data['input_modes']
        assert 'english' in data['input_modes']
    
    def test_settings_update_without_auth_redirects(self, client):
        """Test settings update without authentication."""
        response = client.post('/begginer/verbs/settings', data={
            'display_mode': 'kanji'
        }, follow_redirects=False)
        assert response.status_code == 302
        assert '/auth/login' in response.location
    
    def test_settings_update_with_test_auth_success(self, test_mode_client):
        """Test settings update with test authentication."""
        response = test_mode_client.post('/begginer/verbs/settings', data={
            'display_mode': 'kanji',
            'furigana_enabled': '1',
            'auto_advance': '0'
        })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert 'message' in data
        assert 'settings' in data
    
    def test_check_endpoint_with_test_auth(self, test_mode_client):
        """Test check endpoint with test authentication."""
        response = test_mode_client.post('/begginer/verbs/check', data={
            'item_id': '1',
            'user_english': 'test'
        })
        assert response.status_code == 200
        assert b'flashcard' in response.data.lower()


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
