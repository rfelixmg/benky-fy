"""
Integration tests for refactored modules working together.
"""

import pytest
import os
from unittest.mock import patch, MagicMock

from app.flashcard.engines.vocab import VocabFlashcardEngine
from app.flashcard.engines.verb import VerbFlashcardEngine
from app.settings import get_user_settings, update_user_settings
from app.conjugation import create_conjugation_checker


class TestFlashcardSettingsIntegration:
    """Test integration between flashcard engines and settings."""
    
    def test_vocab_engine_with_settings(self, temp_json_file, sample_vocab_data, cleanup_temp_files, mock_user_settings):
        """Test VocabFlashcardEngine working with settings."""
        temp_file = temp_json_file(sample_vocab_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VocabFlashcardEngine(temp_file, "test_module")
        
        # Update settings
        test_settings = {
            'display_mode': 'kanji_furigana',
            'furigana_style': 'ruby',
            'kana_types': ['hiragana']
        }
        update_user_settings("test_module", test_settings)
        
        # Get settings and use with engine
        settings = get_user_settings("test_module")
        item = engine.get_next_with_display_mode(settings)
        
        assert item is not None
        assert hasattr(item, 'english')
        assert item.english in ["house", "mountain"]
    
    def test_verb_engine_with_conjugation_settings(self, temp_json_file, sample_verb_data, cleanup_temp_files, mock_user_settings):
        """Test VerbFlashcardEngine working with conjugation settings."""
        temp_file = temp_json_file(sample_verb_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VerbFlashcardEngine(temp_file, "test_module")
        
        # Update settings with conjugation mode
        test_settings = {
            'conjugation_mode': True,
            'conjugation_forms': ['polite', 'casual'],
            'conjugation_prompt_style': 'english',
            'display_mode': 'kanji'
        }
        update_user_settings("test_module", test_settings)
        
        # Get settings and use with engine
        settings = get_user_settings("test_module")
        item = engine.get_next_with_display_mode(settings)
        
        assert item is not None
        assert hasattr(item, 'prompt')
        assert hasattr(item, 'prompt_script')
        assert hasattr(item, 'answer')
        assert item.prompt_script in ["conjugation_english", "conjugation_hiragana"]


class TestConjugationIntegration:
    """Test integration between conjugation checker and flashcard engines."""
    
    def test_verb_engine_conjugation_checking(self, temp_json_file, sample_verb_data, cleanup_temp_files):
        """Test VerbFlashcardEngine conjugation answer checking."""
        temp_file = temp_json_file(sample_verb_data)
        cleanup_temp_files.append(temp_file)
        
        engine = VerbFlashcardEngine(temp_file, "test_module")
        conjugation_checker = create_conjugation_checker()
        
        # Get a verb item
        item = engine._data[0]  # "to eat"
        
        # Test conjugation answer checking
        result = engine.check_conjugation_answer("食べます", item, "polite")
        
        assert isinstance(result, dict)
        assert 'is_correct' in result
        assert 'feedback' in result
        assert 'conjugation_form' in result
        assert result['conjugation_form'] == 'polite'
    
    def test_conjugation_checker_with_verb_data(self, sample_verb_data):
        """Test conjugation checker working with verb data from flashcard engine."""
        conjugation_checker = create_conjugation_checker()
        
        # Simulate verb data from flashcard engine
        verb_data = sample_verb_data[0]  # "to eat"
        
        # Test different conjugation forms
        polite_result = conjugation_checker.check_answer("食べます", verb_data, "polite", "verb")
        casual_result = conjugation_checker.check_answer("食べる", verb_data, "casual", "verb")
        
        assert isinstance(polite_result, ConjugationResult)
        assert isinstance(casual_result, ConjugationResult)
        assert polite_result.conjugation_form == "polite"
        assert casual_result.conjugation_form == "casual"
    
    def test_conjugation_checker_with_adjective_data(self, sample_adjective_data):
        """Test conjugation checker working with adjective data."""
        conjugation_checker = create_conjugation_checker()
        
        # Simulate adjective data
        adj_data = sample_adjective_data[0]  # "big"
        
        # Test different conjugation forms
        present_result = conjugation_checker.check_answer("大きい", adj_data, "present", "adjective")
        past_result = conjugation_checker.check_answer("大きかった", adj_data, "past", "adjective")
        
        assert isinstance(present_result, ConjugationResult)
        assert isinstance(past_result, ConjugationResult)
        assert present_result.conjugation_form == "present"
        assert past_result.conjugation_form == "past"


class TestModuleFactoryIntegration:
    """Test integration of module factory functions."""
    
    def test_create_vocab_module_with_settings(self, temp_json_file, sample_vocab_data, cleanup_temp_files, mock_user_settings):
        """Test creating vocabulary module and using with settings."""
        from app.flashcard import create_vocab_flashcard_module
        
        temp_file = temp_json_file(sample_vocab_data)
        cleanup_temp_files.append(temp_file)
        
        # Create module
        blueprint = create_vocab_flashcard_module("test_module", temp_file)
        
        assert blueprint is not None
        assert blueprint.module_name == "test_module"
        assert blueprint.engine_type == "vocab"
        
        # Test that engine works with settings
        engine = blueprint.engine
        settings = get_user_settings("test_module")
        item = engine.get_next_with_display_mode(settings)
        
        assert item is not None
        assert hasattr(item, 'english')
    
    def test_create_verb_module_with_conjugation(self, temp_json_file, sample_verb_data, cleanup_temp_files):
        """Test creating verb module and using with conjugation."""
        from app.flashcard import create_verb_flashcard_module
        
        temp_file = temp_json_file(sample_verb_data)
        cleanup_temp_files.append(temp_file)
        
        # Create module
        blueprint = create_verb_flashcard_module("test_module", temp_file)
        
        assert blueprint is not None
        assert blueprint.module_name == "test_module"
        assert blueprint.engine_type == "verb"
        
        # Test conjugation functionality
        engine = blueprint.engine
        item = engine._data[0]
        result = engine.check_conjugation_answer("食べます", item, "polite")
        
        assert isinstance(result, dict)
        assert 'is_correct' in result


class TestEndToEndWorkflow:
    """Test complete end-to-end workflows."""
    
    def test_vocab_learning_workflow(self, temp_json_file, sample_vocab_data, cleanup_temp_files, mock_user_settings):
        """Test complete vocabulary learning workflow."""
        from app.flashcard import create_vocab_flashcard_module
        
        temp_file = temp_json_file(sample_vocab_data)
        cleanup_temp_files.append(temp_file)
        
        # 1. Create module
        blueprint = create_vocab_flashcard_module("test_module", temp_file)
        
        # 2. Configure settings
        settings = {
            'display_mode': 'kanji_furigana',
            'furigana_style': 'ruby',
            'kana_types': ['hiragana'],
            'input_modes': ['romaji', 'hiragana']
        }
        update_user_settings("test_module", settings)
        
        # 3. Get flashcards with settings
        engine = blueprint.engine
        retrieved_settings = get_user_settings("test_module")
        
        # 4. Generate multiple flashcards
        items = []
        for _ in range(5):
            item = engine.get_next_with_display_mode(retrieved_settings)
            items.append(item)
        
        # 5. Verify results
        assert len(items) == 5
        for item in items:
            assert isinstance(item, FlashcardItem)
            assert item.english in ["house", "mountain"]
    
    def test_verb_conjugation_workflow(self, temp_json_file, sample_verb_data, cleanup_temp_files, mock_user_settings):
        """Test complete verb conjugation workflow."""
        from app.flashcard import create_verb_flashcard_module
        
        temp_file = temp_json_file(sample_verb_data)
        cleanup_temp_files.append(temp_file)
        
        # 1. Create module
        blueprint = create_verb_flashcard_module("test_module", temp_file)
        
        # 2. Configure conjugation settings
        settings = {
            'conjugation_mode': True,
            'conjugation_forms': ['polite', 'casual'],
            'conjugation_prompt_style': 'english',
            'display_mode': 'kanji'
        }
        update_user_settings("test_module", settings)
        
        # 3. Get conjugation flashcards
        engine = blueprint.engine
        retrieved_settings = get_user_settings("test_module")
        
        # 4. Generate conjugation prompts
        conjugation_items = []
        for _ in range(3):
            item = engine.get_next_with_display_mode(retrieved_settings)
            conjugation_items.append(item)
        
        # 5. Test conjugation checking
        for item in conjugation_items:
            if hasattr(item, 'answer'):  # Conjugation item
                result = engine.check_conjugation_answer("test_answer", item, item.answer)
                assert isinstance(result, dict)
                assert 'is_correct' in result
                assert 'feedback' in result
