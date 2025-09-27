"""
Test suite for Katakana Words Module.

Tests the katakana_words module functionality including:
- Module accessibility and data loading
- API endpoints (dataset-info, display-text, correct-answers)
- Settings integration
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


class TestKatakanaWordsModule(TestFixtures):
    """Tests for katakana_words module functionality."""

    def test_katakana_words_module_accessibility(self, test_mode_client):
        """Test that katakana_words module is accessible and loads correctly."""
        response = test_mode_client.get('/begginer/katakana-words/')
        TestAssertions.assert_successful_response(response)
        TestAssertions.assert_contains_content(response, 'flashcard')
        
        # Verify the module name is correctly displayed
        TestAssertions.assert_contains_content(response, 'Katakana_words')

    def test_katakana_words_dataset_info(self, client):
        """Test dataset info endpoint for katakana_words module."""
        response = client.get('/begginer/katakana-words/api/dataset-info')
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        assert 'total_items' in data
        assert 'module_name' in data
        assert 'message' in data
        assert data['module_name'] == 'katakana_words'
        assert isinstance(data['total_items'], int)
        assert data['total_items'] > 0
        
        # Verify we have katakana words data
        assert data['total_items'] >= 50  # Should have at least 50 words as per requirements

    def test_katakana_words_display_text_api(self, test_mode_client):
        """Test display text API for katakana_words module with katakana-specific settings."""
        # Test with katakana display mode
        params = {
            'item_id': '1',
            'display_mode': 'kana',
            'kana_type': 'katakana',
            'furigana_style': 'ruby',
            'proportions.kana': '0.3',
            'proportions.kanji': '0.2',
            'proportions.kanji_furigana': '0.2',
            'proportions.english': '0.3'
        }
        
        response = test_mode_client.get('/begginer/katakana-words/api/display-text', query_string=params)
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        assert 'text' in data
        assert 'script' in data
        assert 'mode' in data
        assert 'fallback_used' in data
        assert isinstance(data['fallback_used'], bool)
        
        # Verify katakana-specific content
        assert data['script'] in ['katakana', 'hiragana']  # Should be katakana or fallback to hiragana
        assert data['mode'] == 'kana'
        
        # Verify the text contains katakana characters (ア-ン range)
        import re
        katakana_pattern = r'[ア-ン]'
        assert re.search(katakana_pattern, data['text']), f"Expected katakana characters in: {data['text']}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
