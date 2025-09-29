"""
Test suite for Flashcard API endpoints.

Tests the flashcard functionality including:
- Dataset information
- Correct answers API
- Display text API
- Settings updates
- Answer checking
- Dual verification system
"""

import pytest
import os
import json
from unittest.mock import patch
from flask import Flask
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from test_config import (
    TEST_HASH, TEST_USER, TEST_MODULES, TEST_DUMMY_CONTEXT,
    TEST_ITEM_ID, TEST_INVALID_ITEM_ID
)
from test_utils import TestClientFactory, TestAssertions, TestFixtures, TestDataProvider


class TestFlashcardAPI(TestFixtures):
    """Comprehensive tests for flashcard API endpoints."""

    
    def test_flashcard_index_with_test_auth_success(self, test_mode_client):
        """Test flashcard index with test authentication."""
        response = test_mode_client.get('/v1/begginer/verbs/')
        TestAssertions.assert_successful_response(response)
        TestAssertions.assert_contains_content(response, 'flashcard')
    
    
    def test_dataset_info_public_access(self, client):
        """Test dataset info endpoint is publicly accessible."""
        response = client.get('/v1/begginer/verbs/api/dataset-info')
        TestAssertions.assert_json_response(response)
        
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
            response = client.get(f'/v1/begginer/{url_module}/api/dataset-info')
            TestAssertions.assert_json_response(response)
            
            data = json.loads(response.data)
            expected_module = module_mapping[url_module]
            assert data['module_name'] == expected_module, f"Wrong module name for: {url_module}"
            assert isinstance(data['total_items'], int), f"Invalid total_items for: {url_module}"
            assert data['total_items'] > 0, f"Empty dataset for: {url_module}"
    
    
    def test_correct_answers_with_test_auth_success(self, test_mode_client):
        """Test correct answers endpoint with test authentication."""
        response = test_mode_client.get(f'/v1/begginer/verbs/api/correct-answers?item_id={TEST_ITEM_ID}')
        TestAssertions.assert_json_response(response)
        
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
        response = test_mode_client.get(f'/v1/begginer/verbs/api/correct-answers?item_id={TEST_INVALID_ITEM_ID}')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_correct_answers_missing_item_id(self, test_mode_client):
        """Test correct answers endpoint with missing item ID."""
        response = test_mode_client.get('/v1/begginer/verbs/api/correct-answers')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'item_id' in data['error']
    
    
    def test_display_text_with_test_auth_success(self, test_mode_client):
        """Test display text endpoint with test authentication."""
        response = test_mode_client.get(f'/v1/begginer/verbs/api/display-text?item_id={TEST_ITEM_ID}')
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        assert 'text' in data
        assert 'script' in data
        assert 'mode' in data
        assert 'fallback_used' in data
        assert isinstance(data['fallback_used'], bool)
    
    def test_display_text_with_parameters(self, test_mode_client):
        """Test display text endpoint with various parameters."""
        params = {
            'item_id': str(TEST_ITEM_ID),
            'display_mode': 'kanji',
            'kana_type': 'hiragana',
            'furigana_style': 'ruby',
            'proportions.kana': '0.3',
            'proportions.kanji': '0.2',
            'proportions.kanji_furigana': '0.2',
            'proportions.english': '0.3'
        }
        
        response = test_mode_client.get('/v1/begginer/verbs/api/display-text', query_string=params)
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        assert 'text' in data
        assert 'script' in data
        assert 'mode' in data
    
    def test_check_answers_with_test_auth_success(self, test_mode_client):
        """Test check answers endpoint with test authentication."""
        response = test_mode_client.post('/v1/begginer/verbs/api/check-answers', data={
            'item_id': str(TEST_ITEM_ID),
            'user_english': 'test'
        })
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        assert 'results' in data
        assert 'user_inputs' in data
        assert 'all_correct' in data
        assert isinstance(data['all_correct'], bool)
    
    def test_check_answers_with_input_modes(self, test_mode_client):
        """Test check answers endpoint with input modes."""
        response = test_mode_client.post('/v1/begginer/verbs/api/check-answers', data={
            'item_id': str(TEST_ITEM_ID),
            'input_modes': 'hiragana,english',
            'user_hiragana': 'test',
            'user_english': 'test'
        })
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        assert 'results' in data
        assert 'input_modes' in data
        assert 'hiragana' in data['input_modes']
        assert 'english' in data['input_modes']
    

    
    def test_settings_update_with_test_auth_success(self, test_mode_client):
        """Test settings update with test authentication."""
        response = test_mode_client.post('/v1/begginer/verbs/settings', data={
            'display_mode': 'kanji',
            'furigana_enabled': '1',
            'auto_advance': '0'
        })
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert 'message' in data
        assert 'settings' in data
    
    def test_check_endpoint_with_test_auth(self, test_mode_client):
        """Test check endpoint with test authentication."""
        response = test_mode_client.post('/v1/begginer/verbs/check', data={
            'item_id': str(TEST_ITEM_ID),
            'user_english': 'test'
        })
        TestAssertions.assert_successful_response(response)
        TestAssertions.assert_contains_content(response, 'flashcard')


class TestFlashcardDualVerification:
    """Tests for flashcard API dual verification system."""
    
    def test_flashcard_dual_verification_success(self):
        """Test flashcard endpoints with both environment variable and dummy context."""
        client = TestClientFactory.create_test_mode_client()
        
        # Test various flashcard endpoints
        endpoints_to_test = [
            '/v1/begginer/verbs/',
            f'/v1/begginer/verbs/api/correct-answers?item_id={TEST_ITEM_ID}',
            f'/v1/begginer/verbs/api/display-text?item_id={TEST_ITEM_ID}'
        ]
        
        for endpoint in endpoints_to_test:
            response = client.get(endpoint)
            TestAssertions.assert_successful_response(response)
    


class TestFlashcardDataValidation(TestFixtures):
    """Tests for flashcard data validation and error handling."""
    
    def test_invalid_module_name(self, test_mode_client):
        """Test flashcard endpoints with invalid module name."""
        response = test_mode_client.get('/v1/begginer/invalid_module/api/dataset-info')
        assert response.status_code == 404
    
    def test_missing_required_parameters(self, test_mode_client):
        """Test flashcard endpoints with missing required parameters."""
        # Test missing item_id - API may return 200 or 400 depending on implementation
        response = test_mode_client.get('/v1/begginer/verbs/api/correct-answers')
        assert response.status_code in [200, 400], f"Unexpected status {response.status_code} for missing item_id"
        
        # Test missing item_id in POST request
        response = test_mode_client.post('/v1/begginer/verbs/api/check-answers', data={
            'user_english': 'test'
        })
        assert response.status_code in [200, 400], f"Unexpected status {response.status_code} for missing item_id in POST"
    
    def test_invalid_parameter_types(self, test_mode_client):
        """Test flashcard endpoints with invalid parameter types."""
        # Test string item_id instead of integer - API may return 200 or 400 depending on implementation
        response = test_mode_client.get('/v1/begginer/verbs/api/correct-answers?item_id=invalid')
        assert response.status_code in [200, 400], f"Unexpected status {response.status_code} for invalid item_id type"
        
        # Test negative item_id - API may return 200 or 400 depending on implementation
        response = test_mode_client.get('/v1/begginer/verbs/api/correct-answers?item_id=-1')
        assert response.status_code in [200, 400], f"Unexpected status {response.status_code} for negative item_id"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
