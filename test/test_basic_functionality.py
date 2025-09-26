"""
Basic functionality tests for refactored modules.
Tests core functionality without complex mocking.
"""

import pytest
import tempfile
import json
import os


class TestBasicImports:
    """Test that all refactored modules can be imported."""
    
    def test_flashcard_imports(self):
        """Test flashcard module imports."""
        from app.flashcard import create_vocab_flashcard_module, create_verb_flashcard_module, create_adjective_flashcard_module
        from app.flashcard.engines.vocab import VocabFlashcardEngine
        from app.flashcard.models.item import FlashcardItem
        
        assert create_vocab_flashcard_module is not None
        assert create_verb_flashcard_module is not None
        assert create_adjective_flashcard_module is not None
        assert VocabFlashcardEngine is not None
        assert FlashcardItem is not None
    
    def test_settings_imports(self):
        """Test settings module imports."""
        from app.settings import get_user_settings, update_user_settings, settings_registry
        from app.settings.models.definitions import SettingDefinition, SettingsGroup, SettingsPlugin
        
        assert get_user_settings is not None
        assert update_user_settings is not None
        assert settings_registry is not None
        assert SettingDefinition is not None
        assert SettingsGroup is not None
        assert SettingsPlugin is not None
    
    def test_conjugation_imports(self):
        """Test conjugation module imports."""
        from app.conjugation import create_conjugation_checker
        from app.conjugation.models.result import ConjugationResult
        from app.conjugation.checkers.main import ConjugationAnswerChecker
        
        assert create_conjugation_checker is not None
        assert ConjugationResult is not None
        assert ConjugationAnswerChecker is not None


class TestFlashcardItem:
    """Test FlashcardItem with correct parameters."""
    
    def test_flashcard_item_creation(self):
        """Test creating a FlashcardItem with all required fields."""
        from app.flashcard.models.item import FlashcardItem
        
        item = FlashcardItem(
            index=1,
            kanji="家",
            hiragana="いえ",
            katakana="イエ",
            romaji="ie",
            english="house",
            prompt="house",
            answer="家",
            prompt_script="english",
            answer_script="kanji",
            category="place",
            priority=1,
            learning_order=1
        )
        
        assert item.index == 1
        assert item.kanji == "家"
        assert item.hiragana == "いえ"
        assert item.english == "house"
        assert item.category == "place"
        assert item.priority == 1
        assert item.learning_order == 1


class TestVocabEngine:
    """Test VocabFlashcardEngine basic functionality."""
    
    def test_vocab_engine_creation(self):
        """Test creating a VocabFlashcardEngine."""
        from app.flashcard.engines.vocab import VocabFlashcardEngine
        
        test_data = [
            {
                "english": "house",
                "kanji": "家",
                "hiragana": "いえ",
                "romaji": "ie",
                "category": "place",
                "priority": 1,
                "learning_order": 1
            }
        ]
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(test_data, f)
            temp_file = f.name
        
        try:
            engine = VocabFlashcardEngine(temp_file, "test_module")
            assert engine.filename == temp_file
            assert engine.module_name == "test_module"
            assert len(engine._data) == 1
            assert engine._data[0].english == "house"
        finally:
            os.unlink(temp_file)


class TestConjugationChecker:
    """Test conjugation checker basic functionality."""
    
    def test_conjugation_checker_creation(self):
        """Test creating a conjugation checker."""
        from app.conjugation import create_conjugation_checker
        
        checker = create_conjugation_checker()
        assert checker is not None
        assert hasattr(checker, 'check_answer')
    
    def test_conjugation_result_creation(self):
        """Test creating a ConjugationResult."""
        from app.conjugation.models.result import ConjugationResult
        
        result = ConjugationResult(
            user_input="食べます",
            correct_answer="食べます",
            is_correct=True,
            feedback="Correct!",
            conjugation_form="polite"
        )
        
        assert result.user_input == "食べます"
        assert result.correct_answer == "食べます"
        assert result.is_correct is True
        assert result.feedback == "Correct!"
        assert result.conjugation_form == "polite"


class TestModuleFactories:
    """Test module factory functions."""
    
    def test_create_vocab_module(self):
        """Test creating a vocabulary flashcard module."""
        from app.flashcard import create_vocab_flashcard_module
        
        test_data = [
            {
                "english": "house",
                "kanji": "家",
                "hiragana": "いえ",
                "romaji": "ie",
                "category": "place",
                "priority": 1,
                "learning_order": 1
            }
        ]
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(test_data, f)
            temp_file = f.name
        
        try:
            blueprint = create_vocab_flashcard_module("test_module", temp_file)
            assert blueprint is not None
            assert blueprint.name == "test_module"
        finally:
            os.unlink(temp_file)


class TestSettingsBasic:
    """Test settings basic functionality."""
    
    def test_setting_definition_creation(self):
        """Test creating a SettingDefinition with correct parameters."""
        from app.settings.models.definitions import SettingDefinition
        
        setting = SettingDefinition(
            key="test_setting",
            name="Test Setting",
            description="A test setting",
            type="text",
            default_value="default"
        )
        
        assert setting.key == "test_setting"
        assert setting.name == "Test Setting"
        assert setting.description == "A test setting"
        assert setting.type == "text"
        assert setting.default_value == "default"
    
    def test_settings_group_creation(self):
        """Test creating a SettingsGroup."""
        from app.settings.models.definitions import SettingsGroup, SettingDefinition
        
        setting = SettingDefinition(
            key="test_setting",
            name="Test Setting",
            description="A test setting",
            type="text",
            default_value="default"
        )
        
        group = SettingsGroup(
            name="test_group",
            description="Test settings group",
            settings=[setting]
        )
        
        assert group.name == "test_group"
        assert group.description == "Test settings group"
        assert len(group.settings) == 1
        assert group.settings[0].key == "test_setting"


class TestIntegrationBasic:
    """Test basic integration between modules."""
    
    def test_flashcard_with_conjugation_imports(self):
        """Test that flashcard engines can import conjugation checkers."""
        from app.flashcard.engines.verb import VerbFlashcardEngine
        from app.conjugation import create_conjugation_checker
        
        # This should not raise import errors
        assert VerbFlashcardEngine is not None
        assert create_conjugation_checker is not None
    
    def test_settings_with_flashcard_imports(self):
        """Test that flashcard engines can import settings."""
        from app.flashcard.engines.vocab import VocabFlashcardEngine
        from app.settings import get_user_settings
        
        # This should not raise import errors
        assert VocabFlashcardEngine is not None
        assert get_user_settings is not None
