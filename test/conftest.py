"""
Pytest configuration and fixtures for Benky-Fy tests.
"""

import pytest
import json
import tempfile
import os
from unittest.mock import patch, MagicMock


@pytest.fixture
def temp_json_file():
    """Create a temporary JSON file for testing."""
    def _create_temp_file(data):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(data, f)
            return f.name
    return _create_temp_file


@pytest.fixture
def cleanup_temp_files():
    """Cleanup temporary files after tests."""
    temp_files = []
    yield temp_files
    for file_path in temp_files:
        if os.path.exists(file_path):
            os.unlink(file_path)


@pytest.fixture
def mock_user_settings():
    """Mock user settings for testing."""
    with patch('app.settings.utils.functions._user_settings', {}) as mock:
        yield mock


@pytest.fixture
def sample_vocab_data():
    """Sample vocabulary data for testing."""
    return [
        {
            "english": "house",
            "kanji": "家",
            "hiragana": "いえ",
            "romaji": "ie",
            "category": "place",
            "priority": 1,
            "learning_order": 1
        },
        {
            "english": "mountain",
            "kanji": "山",
            "hiragana": "やま",
            "romaji": "yama",
            "category": "nature",
            "priority": 1,
            "learning_order": 2
        }
    ]


@pytest.fixture
def sample_verb_data():
    """Sample verb data for testing."""
    return [
        {
            "english": "to eat",
            "kanji": "食べる",
            "hiragana": "たべる",
            "romaji": "taberu",
            "conjugation_type": "ichidan",
            "priority": 1,
            "learning_order": 1
        },
        {
            "english": "to drink",
            "kanji": "飲む",
            "hiragana": "のむ",
            "romaji": "nomu",
            "conjugation_type": "godan",
            "priority": 1,
            "learning_order": 2
        }
    ]


@pytest.fixture
def sample_adjective_data():
    """Sample adjective data for testing."""
    return [
        {
            "english": "big",
            "kanji": "大きい",
            "hiragana": "おおきい",
            "romaji": "ookii",
            "conjugation_type": "i-adjective",
            "priority": 1,
            "learning_order": 1
        },
        {
            "english": "beautiful",
            "kanji": "美しい",
            "hiragana": "うつくしい",
            "romaji": "utsukushii",
            "conjugation_type": "i-adjective",
            "priority": 1,
            "learning_order": 2
        }
    ]
