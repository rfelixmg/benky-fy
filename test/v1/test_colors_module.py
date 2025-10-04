"""
Test suite for Colors module API endpoints.
"""

import pytest
import json
from test_config import TEST_HASH, TEST_USER
from test_utils import TestClientFactory, TestAssertions, TestFixtures

class TestColorsModule(TestFixtures):
    """Tests for colors module functionality."""
    
    def test_colors_endpoint_structure(self, test_mode_client):
        """Test colors endpoint returns correct data structure."""
        response = test_mode_client.get('/flashcards/colors')
        TestAssertions.assert_json_response(response)
        
        data = json.loads(response.data)
        # Verify required data structures
        assert 'colors' in data
        assert isinstance(data['colors'], list)
        assert len(data['colors']) > 0
        
        # Verify color object structure
        first_color = data['colors'][0]
        assert 'kanji' in first_color
        assert 'hiragana' in first_color
        assert 'english' in first_color
        assert 'hex' in first_color
        
        # Verify practice sets
        assert 'practice_sets' in data
        assert isinstance(data['practice_sets'], list)
        
        # Verify quiz questions
        assert 'quiz_questions' in data
        assert isinstance(data['quiz_questions'], list)

    def test_colors_content_validation(self, test_mode_client):
        """Test colors endpoint content is valid."""
        response = test_mode_client.get('/flashcards/colors')
        data = json.loads(response.data)
        
        for color in data['colors']:
            # Verify kanji is not empty
            assert color['kanji'], "Kanji should not be empty"
            # Verify hiragana is not empty
            assert color['hiragana'], "Hiragana should not be empty"
            # Verify english translation exists
            assert color['english'], "English translation should not be empty"
            # Verify hex color format
            assert color['hex'].startswith('#'), "Hex color should start with #"
            assert len(color['hex']) == 7, "Hex color should be 7 characters"

    def test_practice_sets_structure(self, test_mode_client):
        """Test practice sets have correct structure."""
        response = test_mode_client.get('/flashcards/colors')
        data = json.loads(response.data)
        
        for practice_set in data['practice_sets']:
            assert 'id' in practice_set
            assert 'colors' in practice_set
            assert 'type' in practice_set
            assert practice_set['type'] in ['reading', 'matching']
            assert isinstance(practice_set['colors'], list)
            assert len(practice_set['colors']) > 0

    def test_quiz_questions_structure(self, test_mode_client):
        """Test quiz questions have correct structure."""
        response = test_mode_client.get('/flashcards/colors')
        data = json.loads(response.data)
        
        for question in data['quiz_questions']:
            assert 'id' in question
            assert 'question' in question
            assert 'correctAnswer' in question
            assert 'options' in question
            assert 'hint' in question
            assert isinstance(question['options'], list)
            assert len(question['options']) >= 2  # At least 2 options
            assert question['correctAnswer'] in question['options']

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
