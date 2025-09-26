"""
Test suite for the refactored flashcard module.
"""

import pytest
import os
from unittest.mock import patch

from app.flashcard import create_vocab_flashcard_module, create_verb_flashcard_module, create_adjective_flashcard_module
from app.flashcard.engines.base import BaseFlashcardEngine
from app.flashcard.engines.verb import VerbFlashcardEngine
from app.flashcard.engines.adjective import AdjectiveFlashcardEngine
from app.flashcard.engines.vocab import VocabFlashcardEngine
from app.flashcard.blueprints.flashcard_bp import FlashcardBlueprint
from app.flashcard.models.item import FlashcardItem


class TestFlashcardImports:
    """Test that all flashcard module components can be imported."""
    
    def test_module_imports(self):
        """Test that all refactored flashcard modules can be imported."""
        # Main module functions
        assert create_vocab_flashcard_module is not None
        assert create_verb_flashcard_module is not None
        assert create_adjective_flashcard_module is not None
        
        # Engines
        assert BaseFlashcardEngine is not None
        assert VerbFlashcardEngine is not None
        assert AdjectiveFlashcardEngine is not None
        assert VocabFlashcardEngine is not None
        
        # Blueprint
        assert FlashcardBlueprint is not None
        
        # Models
        assert FlashcardItem is not None


class TestFlashcardItem:
    """Test FlashcardItem dataclass."""
    
    def test_flashcard_item_creation(self):
        """Test creating a FlashcardItem."""
        item = FlashcardItem(
            english="house",
            kanji="家",
            hiragana="いえ",
            romaji="ie",
            category="place",
            priority=1,
            learning_order=1
        )
        
        assert item.english == "house"
        assert item.kanji == "家"
        assert item.hiragana == "いえ"
        assert item.romaji == "ie"
        assert item.category == "place"
        assert item.priority == 1
        assert item.learning_order == 1
    
    def test_flashcard_item_with_optional_fields(self):
        """Test FlashcardItem with optional fields."""
        item = FlashcardItem(
            english="house",
            kanji="家",
            hiragana="いえ",
            romaji="ie",
            category="place",
            priority=1,
            learning_order=1,
            grammatical_type="noun",
            conjugation_type="none"
        )
        
        assert item.grammatical_type == "noun"
        assert item.conjugation_type == "none"


class TestVocabFlashcardEngine:
    """Test VocabFlashcardEngine functionality."""
    
    def test_vocab_engine_creation(self, temp_json_file, sample_vocab_data, cleanup_temp_files):
        """Test creating a VocabFlashcardEngine."""
        temp_file = temp_json_file(sample_vocab_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VocabFlashcardEngine(temp_file, "test_module")
        
        assert engine.filename == temp_file
        assert engine.module_name == "test_module"
        assert len(engine._data) == 2
        assert engine._data[0].english == "house"
        assert engine._data[1].english == "mountain"
    
    def test_vocab_engine_get_next(self, temp_json_file, sample_vocab_data, cleanup_temp_files):
        """Test getting next flashcard from VocabFlashcardEngine."""
        temp_file = temp_json_file(sample_vocab_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VocabFlashcardEngine(temp_file, "test_module")
        
        # Test multiple calls to ensure randomness works
        items = [engine.get_next() for _ in range(10)]
        
        # All items should be valid FlashcardItems
        for item in items:
            assert isinstance(item, FlashcardItem)
            assert item.english in ["house", "mountain"]
    
    def test_vocab_engine_get_next_with_display_mode(self, temp_json_file, sample_vocab_data, cleanup_temp_files):
        """Test getting next flashcard with display mode settings."""
        temp_file = temp_json_file(sample_vocab_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VocabFlashcardEngine(temp_file, "test_module")
        
        settings = {
            "display_mode": "kanji",
            "kana_types": ["hiragana"],
            "input_modes": ["romaji", "hiragana"]
        }
        
        item = engine.get_next_with_display_mode(settings)
        
        assert isinstance(item, FlashcardItem)
        assert item.english in ["house", "mountain"]


class TestVerbFlashcardEngine:
    """Test VerbFlashcardEngine functionality."""
    
    def test_verb_engine_creation(self, temp_json_file, sample_verb_data, cleanup_temp_files):
        """Test creating a VerbFlashcardEngine."""
        temp_file = temp_json_file(sample_verb_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VerbFlashcardEngine(temp_file, "test_module")
        
        assert engine.filename == temp_file
        assert engine.module_name == "test_module"
        assert len(engine._data) == 2
        assert engine._data[0].english == "to eat"
        assert engine._data[1].english == "to drink"
    
    def test_verb_engine_conjugation_prompt_generation(self, temp_json_file, sample_verb_data, cleanup_temp_files):
        """Test conjugation prompt generation."""
        temp_file = temp_json_file(sample_verb_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VerbFlashcardEngine(temp_file, "test_module")
        item = engine._data[0]  # "to eat"
        
        # Test English prompt
        prompt, prompt_script = engine.generate_conjugation_prompt(item, "polite", "english")
        assert prompt == "Conjugate 'to eat' in polite form"
        assert prompt_script == "conjugation_english"
        
        # Test Hiragana prompt
        prompt, prompt_script = engine.generate_conjugation_prompt(item, "polite", "hiragana")
        assert prompt == "Conjugate 'たべる' in polite form"
        assert prompt_script == "conjugation_hiragana"
    
    def test_verb_engine_conjugation_mode(self, temp_json_file, sample_verb_data, cleanup_temp_files, mock_user_settings):
        """Test verb engine with conjugation mode enabled."""
        temp_file = temp_json_file(sample_verb_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VerbFlashcardEngine(temp_file, "test_module")
        
        # Mock settings with conjugation mode enabled
        with patch('app.settings.get_user_settings') as mock_get_settings:
            mock_get_settings.return_value = {
                "conjugation_mode": True,
                "conjugation_forms": ["polite", "casual"],
                "conjugation_prompt_style": "english"
            }
            
            item = engine.get_next()
            
            assert hasattr(item, 'prompt')
            assert hasattr(item, 'prompt_script')
            assert hasattr(item, 'answer')
            assert item.prompt_script in ["conjugation_english", "conjugation_hiragana"]


class TestAdjectiveFlashcardEngine:
    """Test AdjectiveFlashcardEngine functionality."""
    
    def test_adjective_engine_creation(self, temp_json_file, sample_adjective_data, cleanup_temp_files):
        """Test creating an AdjectiveFlashcardEngine."""
        temp_file = temp_json_file(sample_adjective_data)
        cleanup_temp_files.append(temp_file)
        
        engine = AdjectiveFlashcardEngine(temp_file, "test_module")
        
        assert engine.filename == temp_file
        assert engine.module_name == "test_module"
        assert len(engine._data) == 2
        assert engine._data[0].english == "big"
        assert engine._data[1].english == "beautiful"


class TestFlashcardBlueprint:
    """Test FlashcardBlueprint functionality."""
    
    def test_blueprint_creation(self, temp_json_file, sample_vocab_data, cleanup_temp_files):
        """Test creating a FlashcardBlueprint."""
        temp_file = temp_json_file(sample_vocab_data)
        cleanup_temp_files.append(temp_file)
        
        blueprint = FlashcardBlueprint("test_module", temp_file, "vocab")
        
        assert blueprint.module_name == "test_module"
        assert blueprint.filename == temp_file
        assert blueprint.engine_type == "vocab"
        assert blueprint.engine is not None


class TestFlashcardModuleFactories:
    """Test flashcard module factory functions."""
    
    def test_create_vocab_flashcard_module(self, temp_json_file, sample_vocab_data, cleanup_temp_files):
        """Test creating a vocabulary flashcard module."""
        temp_file = temp_json_file(sample_vocab_data)
        cleanup_temp_files.append(temp_file)
        
        blueprint = create_vocab_flashcard_module("test_module", temp_file)
        
        assert blueprint is not None
        assert blueprint.name == "test_module"
        assert blueprint.module_name == "test_module"
        assert blueprint.engine_type == "vocab"
    
    def test_create_verb_flashcard_module(self, temp_json_file, sample_verb_data, cleanup_temp_files):
        """Test creating a verb flashcard module."""
        temp_file = temp_json_file(sample_verb_data)
        cleanup_temp_files.append(temp_file)
        
        blueprint = create_verb_flashcard_module("test_module", temp_file)
        
        assert blueprint is not None
        assert blueprint.name == "test_module"
        assert blueprint.module_name == "test_module"
        assert blueprint.engine_type == "verb"
    
    def test_create_adjective_flashcard_module(self, temp_json_file, sample_adjective_data, cleanup_temp_files):
        """Test creating an adjective flashcard module."""
        temp_file = temp_json_file(sample_adjective_data)
        cleanup_temp_files.append(temp_file)
        
        blueprint = create_adjective_flashcard_module("test_module", temp_file)
        
        assert blueprint is not None
        assert blueprint.name == "test_module"
        assert blueprint.module_name == "test_module"
        assert blueprint.engine_type == "adjective"
