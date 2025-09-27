"""
Test suite for conjugation system.

Tests the conjugation functionality including:
- Verb conjugation checking
- Adjective conjugation checking
- Conjugation result validation
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
from test_config import TEST_HASH, TEST_USER, TEST_DUMMY_CONTEXT
from test_utils import TestClientFactory, TestAssertions, TestFixtures


class TestConjugationSystem(TestFixtures):
    """Tests for conjugation system functionality."""
    
    def test_conjugation_api_endpoint_with_test_user(self, test_mode_client):
        """Test conjugation API endpoint with test user authentication."""
        # Test data for conjugation check
        test_data = {
            'user_input': 'よみます',
            'item_id': 1,
            'conjugation_form': 'polite',
            'module_name': 'verbs'
        }
        
        response = test_mode_client.post('/conjugation/api/conjugation/check', 
                                       json=test_data)
        
        TestAssertions.assert_json_response(response)
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert 'is_correct' in data
        assert data['user_input'] == 'よみます'
        assert data['conjugation_form'] == 'polite'
        assert 'correct_answer' in data
    
    def test_conjugation_api_missing_data(self, test_mode_client):
        """Test conjugation API with missing required data."""
        test_data = {
            'user_input': 'よみます',
            # Missing item_id, conjugation_form, module_name
        }
        
        response = test_mode_client.post('/conjugation/api/conjugation/check', 
                                       json=test_data)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing required fields' in data['error']
    
    def test_conjugation_api_invalid_module(self, test_mode_client):
        """Test conjugation API with invalid module name."""
        test_data = {
            'user_input': 'よみます',
            'item_id': 1,
            'conjugation_form': 'polite',
            'module_name': 'invalid_module'
        }
        
        response = test_mode_client.post('/conjugation/api/conjugation/check', 
                                       json=test_data)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid module_name' in data['error']
    
    def test_conjugation_api_correct_answer(self, test_mode_client):
        """Test conjugation API with correct answer."""
        test_data = {
            'user_input': 'します',  # Correct polite form of する
            'item_id': 1,
            'conjugation_form': 'polite',
            'module_name': 'verbs'
        }
        
        response = test_mode_client.post('/conjugation/api/conjugation/check', 
                                       json=test_data)
        
        TestAssertions.assert_json_response(response)
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert data['is_correct'] is True
        assert data['user_input'] == 'します'
        assert data['conjugation_form'] == 'polite'
    
    def test_conjugation_forms_endpoint(self, test_mode_client):
        """Test conjugation forms endpoint."""
        response = test_mode_client.get('/conjugation/api/conjugation/forms/verbs')
        
        TestAssertions.assert_json_response(response)
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert 'forms' in data
        assert isinstance(data['forms'], list)
        assert 'polite' in data['forms']
        assert 'negative' in data['forms']
    
    def test_conjugation_api_invalid_item_id(self, test_mode_client):
        """Test conjugation API with invalid item ID."""
        test_data = {
            'user_input': 'よみます',
            'item_id': 9999,  # Non-existent item ID
            'conjugation_form': 'polite',
            'module_name': 'verbs'
        }
        
        response = test_mode_client.post('/conjugation/api/conjugation/check', 
                                       json=test_data)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid item_id' in data['error']
    
    def test_conjugation_api_adjectives_module(self, test_mode_client):
        """Test conjugation API with adjectives module."""
        test_data = {
            'user_input': '大きい',
            'item_id': 1,
            'conjugation_form': 'present',
            'module_name': 'adjectives'
        }
        
        response = test_mode_client.post('/conjugation/api/conjugation/check', 
                                       json=test_data)
        
        TestAssertions.assert_json_response(response)
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert 'is_correct' in data
        assert data['user_input'] == '大きい'
        assert data['conjugation_form'] == 'present'
    
    def test_conjugation_api_different_conjugation_forms(self, test_mode_client):
        """Test conjugation API with different conjugation forms."""
        # Test negative form
        test_data = {
            'user_input': 'しない',
            'item_id': 1,
            'conjugation_form': 'negative',
            'module_name': 'verbs'
        }
        
        response = test_mode_client.post('/conjugation/api/conjugation/check', 
                                       json=test_data)
        
        TestAssertions.assert_json_response(response)
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert data['conjugation_form'] == 'negative'
        assert 'is_correct' in data
    
    def test_conjugation_forms_endpoint_adjectives(self, test_mode_client):
        """Test conjugation forms endpoint for adjectives."""
        response = test_mode_client.get('/conjugation/api/conjugation/forms/adjectives')
        
        TestAssertions.assert_json_response(response)
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert 'forms' in data
        assert isinstance(data['forms'], list)
        assert 'present' in data['forms']
        assert 'past' in data['forms']
    
    def test_conjugation_api_empty_user_input(self, test_mode_client):
        """Test conjugation API with empty user input."""
        test_data = {
            'user_input': '',  # Empty input
            'item_id': 1,
            'conjugation_form': 'polite',
            'module_name': 'verbs'
        }
        
        response = test_mode_client.post('/conjugation/api/conjugation/check', 
                                       json=test_data)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing required fields' in data['error']


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
