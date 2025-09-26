"""
Test suite for the refactored conjugation module.
"""

import pytest
from unittest.mock import patch, MagicMock

from app.conjugation import create_conjugation_checker
from app.conjugation.models.result import ConjugationResult
from app.conjugation.checkers.base import BaseConjugationChecker
from app.conjugation.checkers.verb import VerbConjugationChecker
from app.conjugation.checkers.adjective import AdjectiveConjugationChecker
from app.conjugation.checkers.main import ConjugationAnswerChecker


class TestConjugationImports:
    """Test that all conjugation module components can be imported."""
    
    def test_module_imports(self):
        """Test that all refactored conjugation modules can be imported."""
        # Main function
        assert create_conjugation_checker is not None
        
        # Models
        assert ConjugationResult is not None
        
        # Checkers
        assert BaseConjugationChecker is not None
        assert VerbConjugationChecker is not None
        assert AdjectiveConjugationChecker is not None
        assert ConjugationAnswerChecker is not None


class TestConjugationResult:
    """Test ConjugationResult model."""
    
    def test_conjugation_result_creation(self):
        """Test creating a ConjugationResult."""
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
    
    def test_conjugation_result_incorrect(self):
        """Test creating an incorrect ConjugationResult."""
        result = ConjugationResult(
            user_input="食べる",
            correct_answer="食べます",
            is_correct=False,
            feedback="Incorrect. The polite form is 食べます.",
            conjugation_form="polite"
        )
        
        assert result.user_input == "食べる"
        assert result.correct_answer == "食べます"
        assert result.is_correct is False
        assert "Incorrect" in result.feedback


class TestBaseConjugationChecker:
    """Test BaseConjugationChecker functionality."""
    
    def test_base_checker_creation(self):
        """Test creating a BaseConjugationChecker."""
        checker = BaseConjugationChecker()
        
        assert checker is not None
        assert hasattr(checker, 'check_answer')
    
    def test_base_checker_check_answer_abstract(self):
        """Test that BaseConjugationChecker.check_answer raises NotImplementedError."""
        checker = BaseConjugationChecker()
        
        with pytest.raises(NotImplementedError):
            checker.check_answer("test", {}, "form", "type")


class TestVerbConjugationChecker:
    """Test VerbConjugationChecker functionality."""
    
    def test_verb_checker_creation(self):
        """Test creating a VerbConjugationChecker."""
        checker = VerbConjugationChecker()
        
        assert checker is not None
        assert hasattr(checker, 'check_answer')
    
    def test_verb_checker_ichidan_polite(self):
        """Test checking ichidan verb polite form."""
        checker = VerbConjugationChecker()
        
        verb_data = {
            'kanji': '食べる',
            'hiragana': 'たべる',
            'romaji': 'taberu',
            'conjugation_type': 'ichidan'
        }
        
        # Test correct answer
        result = checker.check_answer("食べます", verb_data, "polite", "verb")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is True
        assert result.conjugation_form == "polite"
        
        # Test incorrect answer
        result = checker.check_answer("食べる", verb_data, "polite", "verb")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is False
    
    def test_verb_checker_godan_polite(self):
        """Test checking godan verb polite form."""
        checker = VerbConjugationChecker()
        
        verb_data = {
            'kanji': '飲む',
            'hiragana': 'のむ',
            'romaji': 'nomu',
            'conjugation_type': 'godan'
        }
        
        # Test correct answer
        result = checker.check_answer("飲みます", verb_data, "polite", "verb")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is True
        assert result.conjugation_form == "polite"
        
        # Test incorrect answer
        result = checker.check_answer("飲む", verb_data, "polite", "verb")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is False
    
    def test_verb_checker_casual_form(self):
        """Test checking casual form."""
        checker = VerbConjugationChecker()
        
        verb_data = {
            'kanji': '食べる',
            'hiragana': 'たべる',
            'romaji': 'taberu',
            'conjugation_type': 'ichidan'
        }
        
        # Test correct casual form
        result = checker.check_answer("食べる", verb_data, "casual", "verb")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is True
        assert result.conjugation_form == "casual"


class TestAdjectiveConjugationChecker:
    """Test AdjectiveConjugationChecker functionality."""
    
    def test_adjective_checker_creation(self):
        """Test creating an AdjectiveConjugationChecker."""
        checker = AdjectiveConjugationChecker()
        
        assert checker is not None
        assert hasattr(checker, 'check_answer')
    
    def test_adjective_checker_i_adjective_present(self):
        """Test checking i-adjective present form."""
        checker = AdjectiveConjugationChecker()
        
        adj_data = {
            'kanji': '大きい',
            'hiragana': 'おおきい',
            'romaji': 'ookii',
            'conjugation_type': 'i-adjective'
        }
        
        # Test correct present form
        result = checker.check_answer("大きい", adj_data, "present", "adjective")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is True
        assert result.conjugation_form == "present"
        
        # Test incorrect form
        result = checker.check_answer("大きいです", adj_data, "present", "adjective")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is False
    
    def test_adjective_checker_i_adjective_past(self):
        """Test checking i-adjective past form."""
        checker = AdjectiveConjugationChecker()
        
        adj_data = {
            'kanji': '大きい',
            'hiragana': 'おおきい',
            'romaji': 'ookii',
            'conjugation_type': 'i-adjective'
        }
        
        # Test correct past form
        result = checker.check_answer("大きかった", adj_data, "past", "adjective")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is True
        assert result.conjugation_form == "past"
    
    def test_adjective_checker_na_adjective(self):
        """Test checking na-adjective."""
        checker = AdjectiveConjugationChecker()
        
        adj_data = {
            'kanji': '静か',
            'hiragana': 'しずか',
            'romaji': 'shizuka',
            'conjugation_type': 'na-adjective'
        }
        
        # Test correct present form
        result = checker.check_answer("静か", adj_data, "present", "adjective")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is True
        assert result.conjugation_form == "present"


class TestConjugationAnswerChecker:
    """Test ConjugationAnswerChecker functionality."""
    
    def test_conjugation_answer_checker_creation(self):
        """Test creating a ConjugationAnswerChecker."""
        checker = ConjugationAnswerChecker()
        
        assert checker is not None
        assert hasattr(checker, 'check_answer')
    
    def test_conjugation_answer_checker_verb_delegation(self):
        """Test that ConjugationAnswerChecker delegates to VerbConjugationChecker for verbs."""
        checker = ConjugationAnswerChecker()
        
        verb_data = {
            'kanji': '食べる',
            'hiragana': 'たべる',
            'romaji': 'taberu',
            'conjugation_type': 'ichidan'
        }
        
        result = checker.check_answer("食べます", verb_data, "polite", "verb")
        assert isinstance(result, ConjugationResult)
        assert result.conjugation_form == "polite"
    
    def test_conjugation_answer_checker_adjective_delegation(self):
        """Test that ConjugationAnswerChecker delegates to AdjectiveConjugationChecker for adjectives."""
        checker = ConjugationAnswerChecker()
        
        adj_data = {
            'kanji': '大きい',
            'hiragana': 'おおきい',
            'romaji': 'ookii',
            'conjugation_type': 'i-adjective'
        }
        
        result = checker.check_answer("大きい", adj_data, "present", "adjective")
        assert isinstance(result, ConjugationResult)
        assert result.conjugation_form == "present"
    
    def test_conjugation_answer_checker_unknown_type(self):
        """Test ConjugationAnswerChecker with unknown grammatical type."""
        checker = ConjugationAnswerChecker()
        
        data = {
            'kanji': 'テスト',
            'hiragana': 'てすと',
            'romaji': 'tesuto'
        }
        
        result = checker.check_answer("テスト", data, "present", "unknown")
        assert isinstance(result, ConjugationResult)
        # Should return a result even for unknown types


class TestConjugationFactory:
    """Test conjugation factory function."""
    
    def test_create_conjugation_checker(self):
        """Test creating a conjugation checker via factory."""
        checker = create_conjugation_checker()
        
        assert checker is not None
        assert isinstance(checker, ConjugationAnswerChecker)
        assert hasattr(checker, 'check_answer')
    
    def test_conjugation_checker_functionality(self):
        """Test that created conjugation checker works correctly."""
        checker = create_conjugation_checker()
        
        verb_data = {
            'kanji': '食べる',
            'hiragana': 'たべる',
            'romaji': 'taberu',
            'conjugation_type': 'ichidan'
        }
        
        result = checker.check_answer("食べます", verb_data, "polite", "verb")
        assert isinstance(result, ConjugationResult)
        assert result.is_correct is True
        assert result.conjugation_form == "polite"
