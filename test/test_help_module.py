"""Tests for help functionality and word info API."""

import pytest
from app import create_app
from app.help.blueprints.help_bp import HelpBlueprint
from app.help.engines.word_info_engine import WordInfoEngine
from app.help.models.word_info import WordInfo


class TestHelpBlueprint:
    """Test help blueprint functionality."""
    
    def test_help_blueprint_creation(self):
        """Test creating a help blueprint."""
        help_bp = HelpBlueprint()
        blueprint = help_bp.create_blueprint()
        
        assert blueprint is not None
        assert blueprint.name == 'help'
    
    def test_get_flashcard_engine_hiragana(self):
        """Test getting flashcard engine for hiragana module."""
        help_bp = HelpBlueprint()
        engine = help_bp._get_flashcard_engine('hiragana')
        
        assert engine is not None
        assert hasattr(engine, 'get_next')
    
    def test_get_flashcard_engine_verbs(self):
        """Test getting flashcard engine for verbs module."""
        help_bp = HelpBlueprint()
        engine = help_bp._get_flashcard_engine('verbs')
        
        assert engine is not None
        assert hasattr(engine, 'get_next')
    
    def test_get_flashcard_engine_invalid_module(self):
        """Test getting flashcard engine for invalid module."""
        help_bp = HelpBlueprint()
        engine = help_bp._get_flashcard_engine('invalid_module')
        
        assert engine is None


class TestWordInfoEngine:
    """Test word info engine functionality."""
    
    def test_word_info_engine_creation(self):
        """Test creating a word info engine."""
        engine = WordInfoEngine()
        
        assert engine is not None
        assert hasattr(engine, 'extract_word_info')
        assert hasattr(engine, 'get_display_info')
    
    def test_extract_word_info_basic(self):
        """Test extracting basic word information."""
        engine = WordInfoEngine()
        
        item_data = {
            'kanji': '家',
            'hiragana': 'いえ',
            'english': 'house',
            'romaji': 'ie'
        }
        
        word_info = engine.extract_word_info(item_data, 'vocab', 1)
        
        assert isinstance(word_info, WordInfo)
        assert word_info.kanji == '家'
        assert word_info.hiragana == 'いえ'
        assert word_info.english == 'house'
        assert word_info.module_name == 'vocab'
        assert word_info.item_index == 1
    
    def test_extract_word_info_with_furigana(self):
        """Test extracting word information with furigana."""
        engine = WordInfoEngine()
        
        item_data = {
            'kanji': '学校',
            'hiragana': 'がっこう',
            'english': 'school',
            'furigana_html': '<ruby>学校<rt>がっこう</rt></ruby>'
        }
        
        word_info = engine.extract_word_info(item_data, 'vocab', 1)
        
        assert word_info.kanji == '学校'
        assert word_info.furigana_text == 'がっこう'
    
    def test_get_display_info(self):
        """Test getting display information."""
        engine = WordInfoEngine()
        
        word_info = WordInfo(
            kanji='家',
            hiragana='いえ',
            katakana='',
            romaji='ie',
            english='house',
            module_name='vocab',
            item_index=1
        )
        
        display_info = engine.get_display_info(word_info)
        
        assert isinstance(display_info, dict)
        assert 'kanji' in display_info
        assert 'hiragana' in display_info
        assert 'english' in display_info
        assert display_info['kanji']['visible'] is True
        assert display_info['kanji']['value'] == '家'


class TestHelpAPI:
    """Test help API endpoints."""
    
    @pytest.fixture
    def app(self):
        """Create test app."""
        app = create_app()
        app.config['TESTING'] = True
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client."""
        return app.test_client()
    
    def test_word_info_api_missing_params(self, client):
        """Test word info API with missing parameters."""
        response = client.get('/help/api/word-info')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'required' in data['error']
    
    def test_word_info_api_invalid_module(self, client):
        """Test word info API with invalid module."""
        response = client.get('/help/api/word-info?module_name=invalid&item_id=1')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert 'not found' in data['error']
    
    def test_word_info_api_invalid_item_id(self, client):
        """Test word info API with invalid item ID."""
        response = client.get('/help/api/word-info?module_name=hiragana&item_id=999999')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'Invalid item_id' in data['error']
    
    def test_word_info_api_success(self, client):
        """Test successful word info API call."""
        response = client.get('/help/api/word-info?module_name=hiragana&item_id=1')
        
        # Should succeed (200) or require authentication (401/403)
        assert response.status_code in [200, 401, 403]
        
        if response.status_code == 200:
            data = response.get_json()
            assert 'success' in data
            assert data['success'] is True
            assert 'word_info' in data
            assert 'display_info' in data
            assert isinstance(data['word_info'], dict)
            assert isinstance(data['display_info'], dict)


class TestWordInfoModel:
    """Test WordInfo model functionality."""
    
    def test_word_info_creation(self):
        """Test creating a WordInfo instance."""
        word_info = WordInfo(
            kanji='家',
            hiragana='いえ',
            katakana='',
            romaji='ie',
            english='house',
            module_name='vocab',
            item_index=1
        )
        
        assert word_info.kanji == '家'
        assert word_info.hiragana == 'いえ'
        assert word_info.english == 'house'
        assert word_info.module_name == 'vocab'
        assert word_info.item_index == 1
    
    def test_word_info_to_dict(self):
        """Test converting WordInfo to dictionary."""
        word_info = WordInfo(
            kanji='家',
            hiragana='いえ',
            katakana='',
            romaji='ie',
            english='house',
            module_name='vocab',
            item_index=1
        )
        
        data = word_info.to_dict()
        
        assert isinstance(data, dict)
        assert data['kanji'] == '家'
        assert data['hiragana'] == 'いえ'
        assert data['english'] == 'house'
        assert data['module_name'] == 'vocab'
        assert data['item_index'] == 1
