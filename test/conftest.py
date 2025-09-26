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
    with patch('app.settings.utils.functions.session', {}) as mock_session:
        yield mock_session


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
            "conjugations": {
                "polite": {"hiragana": "たべます", "kanji": "食べます"},
                "casual": {"hiragana": "たべる", "kanji": "食べる"},
                "past": {"hiragana": "たべた", "kanji": "食べた"}
            },
            "priority": 1,
            "learning_order": 1
        },
        {
            "english": "to drink",
            "kanji": "飲む",
            "hiragana": "のむ",
            "romaji": "nomu",
            "conjugation_type": "godan",
            "conjugations": {
                "polite": {"hiragana": "のみます", "kanji": "飲みます"},
                "casual": {"hiragana": "のむ", "kanji": "飲む"},
                "past": {"hiragana": "のんだ", "kanji": "飲んだ"}
            },
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
            "conjugations": {
                "present": {"hiragana": "おおきい", "kanji": "大きい"},
                "past": {"hiragana": "おおきかった", "kanji": "大きかった"},
                "negative": {"hiragana": "おおきくない", "kanji": "大きくない"}
            },
            "priority": 1,
            "learning_order": 1
        },
        {
            "english": "beautiful",
            "kanji": "美しい",
            "hiragana": "うつくしい",
            "romaji": "utsukushii",
            "conjugation_type": "i-adjective",
            "conjugations": {
                "present": {"hiragana": "うつくしい", "kanji": "美しい"},
                "past": {"hiragana": "うつくしかった", "kanji": "美しかった"},
                "negative": {"hiragana": "うつくしくない", "kanji": "美しくない"}
            },
            "priority": 1,
            "learning_order": 2
        }
    ]
