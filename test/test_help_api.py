"""
Test suite for Help API endpoints.

Tests the word information API including:
- Authentication requirements
- Parameter validation
- Data structure consistency
- Error handling
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
    TEST_HASH, TEST_USER, HELP_API_MODULES, TEST_DUMMY_CONTEXT,
    TEST_ITEM_ID, TEST_INVALID_ITEM_ID, TEST_MODULE_NAME, TEST_INVALID_MODULE_NAME
)
from test_utils import TestClientFactory, TestAssertions, TestFixtures, TestDataProvider


class TestHelpAPI(TestFixtures):
    """Comprehensive tests for help API endpoints."""
    
    def test_word_info_without_auth_redirects(self, client):
        """Test word info endpoint without authentication redirects."""
        response = client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_ITEM_ID}', follow_redirects=False)
        TestAssertions.assert_redirects_to_login(response)
    
    def test_word_info_with_test_auth_success(self, test_mode_client):
        """Test word info endpoint with test authentication returns proper data."""
        response = test_mode_client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_ITEM_ID}')
        TestAssertions.assert_json_response(response)
        
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
    
    def test_word_info_with_env_var_only_fails(self):
        """Test word info endpoint with only environment variable (no dummy context) fails."""
        client = TestClientFactory.create_env_var_only_client()
        response = client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_ITEM_ID}', follow_redirects=False)
        TestAssertions.assert_redirects_to_login(response)
    
    def test_word_info_missing_module_name(self, test_mode_client):
        """Test word info endpoint with missing module_name parameter."""
        response = test_mode_client.get(f'/help/api/word-info?item_id={TEST_ITEM_ID}')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'module_name' in data['error']
        assert 'required' in data['error']
    
    def test_word_info_missing_item_id(self, test_mode_client):
        """Test word info endpoint with missing item_id parameter."""
        response = test_mode_client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}')
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
        response = test_mode_client.get(f'/help/api/word-info?module_name={TEST_INVALID_MODULE_NAME}&item_id={TEST_ITEM_ID}')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'not found' in data['error']
    
    def test_word_info_invalid_item_id_string(self, test_mode_client):
        """Test word info endpoint with invalid item ID (string)."""
        response = test_mode_client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id=invalid')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_word_info_invalid_item_id_out_of_range(self, test_mode_client):
        """Test word info endpoint with item ID out of range."""
        response = test_mode_client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_INVALID_ITEM_ID}')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_word_info_all_modules(self, test_mode_client):
        """Test word info endpoint with all available modules."""
        for module in HELP_API_MODULES:
            response = test_mode_client.get(f'/help/api/word-info?module_name={module}&item_id={TEST_ITEM_ID}')
            TestAssertions.assert_json_response(response)
            
            data = json.loads(response.data)
            assert data['success'] == True, f"Success false for module: {module}"


class TestHelpAPIDualVerification:
    """Tests for help API dual verification system."""
    
    def test_help_dual_verification_success(self):
        """Test help API endpoints with both environment variable and dummy context."""
        client = TestClientFactory.create_test_mode_client()
        
        # Test word info endpoint
        response = client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_ITEM_ID}')
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'word_info' in data
        assert 'display_info' in data
    
    def test_help_env_var_only_fails(self):
        """Test help API endpoints with only environment variable fail."""
        client = TestClientFactory.create_env_var_only_client()
        
        response = client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_ITEM_ID}', follow_redirects=False)
        TestAssertions.assert_redirects_to_login(response)
    
    def test_help_dummy_context_only_fails(self):
        """Test help API endpoints with only dummy context fail."""
        client = TestClientFactory.create_dummy_context_only_client()
        
        response = client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_ITEM_ID}', follow_redirects=False)
        TestAssertions.assert_redirects_to_login(response)
    
    def test_help_neither_condition_fails(self):
        """Test help API endpoints with neither condition fail."""
        client = TestClientFactory.create_production_client()
        
        response = client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_ITEM_ID}', follow_redirects=False)
        TestAssertions.assert_redirects_to_login(response)


class TestHelpAPIDataValidation:
    """Tests for help API data validation and error handling."""
    
    def test_parameter_type_validation(self, test_mode_client):
        """Test help API parameter type validation."""
        # Test invalid item_id types
        invalid_item_ids = ['invalid', 'abc', '1.5', '-1']
        
        for invalid_id in invalid_item_ids:
            response = test_mode_client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={invalid_id}')
            assert response.status_code == 400
    
    def test_module_name_validation(self, test_mode_client):
        """Test help API module name validation."""
        # Test various invalid module names
        invalid_modules = ['', ' ', 'invalid_module', '123', 'module-with-dashes']
        
        for invalid_module in invalid_modules:
            response = test_mode_client.get(f'/help/api/word-info?module_name={invalid_module}&item_id={TEST_ITEM_ID}')
            assert response.status_code in [400, 404]
    
    def test_response_structure_consistency(self, test_mode_client):
        """Test that help API response structure is consistent."""
        response = test_mode_client.get(f'/help/api/word-info?module_name={TEST_MODULE_NAME}&item_id={TEST_ITEM_ID}')
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        
        # Check required fields
        required_fields = ['success', 'word_info', 'display_info', 'message']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Check data types
        assert isinstance(data['success'], bool)
        assert isinstance(data['word_info'], dict)
        assert isinstance(data['display_info'], dict)
        assert isinstance(data['message'], str)
    
    def test_error_response_structure(self, test_mode_client):
        """Test that error responses have consistent structure."""
        # Test missing parameters
        response = test_mode_client.get('/help/api/word-info')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert isinstance(data['error'], str)
        
        # Test invalid module
        response = test_mode_client.get(f'/help/api/word-info?module_name={TEST_INVALID_MODULE_NAME}&item_id={TEST_ITEM_ID}')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert 'error' in data
        assert isinstance(data['error'], str)


class TestHelpAPIModuleCoverage:
    """Tests for help API module coverage."""
    
    def test_all_help_modules_accessible(self, test_mode_client):
        """Test that all help modules are accessible."""
        for module in HELP_API_MODULES:
            response = test_mode_client.get(f'/help/api/word-info?module_name={module}&item_id={TEST_ITEM_ID}')
            
            # Should either succeed or fail gracefully
            assert response.status_code in [200, 400, 404], f"Unexpected status for module: {module}"
            
            if response.status_code == 200:
                data = json.loads(response.data)
                assert data['success'] == True
    
    def test_module_data_consistency(self, test_mode_client):
        """Test that module data is consistent across different modules."""
        successful_responses = []
        
        for module in HELP_API_MODULES:
            response = test_mode_client.get(f'/help/api/word-info?module_name={module}&item_id={TEST_ITEM_ID}')
            
            if response.status_code == 200:
                data = json.loads(response.data)
                if data['success']:
                    successful_responses.append(data)
        
        # If we have successful responses, check structure consistency
        if successful_responses:
            first_response = successful_responses[0]
            for response_data in successful_responses[1:]:
                # Check that all responses have the same structure
                assert set(response_data.keys()) == set(first_response.keys())
                
                # Check that required fields are present
                for field in ['success', 'word_info', 'display_info', 'message']:
                    assert field in response_data


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
