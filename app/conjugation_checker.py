"""
Conjugation Answer Checker System

This module provides answer checking functionality for Japanese verb and adjective conjugations.
It supports different grammatical types and validates user input against correct conjugations.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ConjugationResult:
    """Result of a conjugation answer check"""
    is_correct: bool
    user_input: str
    correct_answer: str
    conjugation_form: str
    feedback: Optional[str] = None


class BaseConjugationChecker(ABC):
    """Base class for conjugation answer checkers"""
    
    @abstractmethod
    def check_conjugation(self, user_input: str, correct_conjugation: Dict[str, str], 
                         form: str) -> ConjugationResult:
        """Check if user input matches the correct conjugation for a specific form"""
        pass
    
    @abstractmethod
    def get_supported_forms(self) -> List[str]:
        """Get list of conjugation forms this checker supports"""
        pass
    
    def normalize_input(self, user_input: str) -> str:
        """Normalize user input for comparison"""
        return user_input.strip().lower()


class VerbConjugationChecker(BaseConjugationChecker):
    """Answer checker for Japanese verb conjugations"""
    
    def __init__(self):
        self.supported_forms = [
            "dictionary", "polite", "negative", "te_form", "past", 
            "negative_past", "potential", "causative", "passive"
        ]
    
    def get_supported_forms(self) -> List[str]:
        return self.supported_forms
    
    def check_conjugation(self, user_input: str, correct_conjugation: Dict[str, str], 
                         form: str) -> ConjugationResult:
        """Check verb conjugation answer"""
        normalized_input = self.normalize_input(user_input)
        
        # Get correct answer for the form
        correct_answer = correct_conjugation.get(form, {}).get('hiragana', '')
        if not correct_answer:
            return ConjugationResult(
                is_correct=False,
                user_input=user_input,
                correct_answer="",
                conjugation_form=form,
                feedback=f"Form '{form}' not available for this verb"
            )
        
        # Normalize correct answer
        normalized_correct = self.normalize_input(correct_answer)
        
        # Check for exact match
        is_correct = normalized_input == normalized_correct
        
        # Provide feedback for common mistakes
        feedback = None
        if not is_correct:
            feedback = self._generate_feedback(normalized_input, normalized_correct, form)
        
        return ConjugationResult(
            is_correct=is_correct,
            user_input=user_input,
            correct_answer=correct_answer,
            conjugation_form=form,
            feedback=feedback
        )
    
    def _generate_feedback(self, user_input: str, correct_answer: str, form: str) -> str:
        """Generate helpful feedback for incorrect answers"""
        if not user_input:
            return "Please enter an answer"
        
        # Check for common conjugation mistakes
        if form == "polite" and not user_input.endswith("ます"):
            return "Polite form should end with ます"
        elif form == "negative" and not user_input.endswith("ない"):
            return "Negative form should end with ない"
        elif form == "past" and not user_input.endswith("た"):
            return "Past form should end with た"
        elif form == "te_form" and not user_input.endswith("て"):
            return "Te-form should end with て"
        
        return f"Try again. The correct {form} form is: {correct_answer}"


class AdjectiveConjugationChecker(BaseConjugationChecker):
    """Answer checker for Japanese adjective conjugations"""
    
    def __init__(self):
        self.supported_forms = [
            "present", "past", "negative", "negative_past", "adverbial"
        ]
    
    def get_supported_forms(self) -> List[str]:
        return self.supported_forms
    
    def check_conjugation(self, user_input: str, correct_conjugation: Dict[str, str], 
                         form: str) -> ConjugationResult:
        """Check adjective conjugation answer"""
        normalized_input = self.normalize_input(user_input)
        
        # Get correct answer for the form
        correct_answer = correct_conjugation.get(form, {}).get('hiragana', '')
        if not correct_answer:
            return ConjugationResult(
                is_correct=False,
                user_input=user_input,
                correct_answer="",
                conjugation_form=form,
                feedback=f"Form '{form}' not available for this adjective"
            )
        
        # Normalize correct answer
        normalized_correct = self.normalize_input(correct_answer)
        
        # Check for exact match
        is_correct = normalized_input == normalized_correct
        
        # Provide feedback for common mistakes
        feedback = None
        if not is_correct:
            feedback = self._generate_feedback(normalized_input, normalized_correct, form)
        
        return ConjugationResult(
            is_correct=is_correct,
            user_input=user_input,
            correct_answer=correct_answer,
            conjugation_form=form,
            feedback=feedback
        )
    
    def _generate_feedback(self, user_input: str, correct_answer: str, form: str) -> str:
        """Generate helpful feedback for incorrect answers"""
        if not user_input:
            return "Please enter an answer"
        
        # Check for common conjugation mistakes
        if form == "past" and not user_input.endswith("かった") and not user_input.endswith("だった"):
            return "Past form should end with かった (i-adjectives) or だった (na-adjectives)"
        elif form == "negative" and not user_input.endswith("ない") and not user_input.endswith("ではない"):
            return "Negative form should end with ない (i-adjectives) or ではない (na-adjectives)"
        elif form == "adverbial" and not user_input.endswith("く") and not user_input.endswith("に"):
            return "Adverbial form should end with く (i-adjectives) or に (na-adjectives)"
        
        return f"Try again. The correct {form} form is: {correct_answer}"


class ConjugationAnswerChecker:
    """Main conjugation answer checker that coordinates different checkers"""
    
    def __init__(self):
        self.verb_checker = VerbConjugationChecker()
        self.adjective_checker = AdjectiveConjugationChecker()
    
    def check_answer(self, user_input: str, item: Dict[str, Any], 
                    conjugation_form: str, grammatical_type: str) -> ConjugationResult:
        """Check conjugation answer based on grammatical type"""
        
        if grammatical_type in ["verb", "irregular_verb"]:
            return self._check_verb_conjugation(user_input, item, conjugation_form)
        elif grammatical_type in ["i_adjective", "na_adjective", "i_adjective_irregular"]:
            return self._check_adjective_conjugation(user_input, item, conjugation_form)
        else:
            return ConjugationResult(
                is_correct=False,
                user_input=user_input,
                correct_answer="",
                conjugation_form=conjugation_form,
                feedback=f"Unsupported grammatical type: {grammatical_type}"
            )
    
    def _check_verb_conjugation(self, user_input: str, item: Dict[str, Any], 
                               form: str) -> ConjugationResult:
        """Check verb conjugation"""
        conjugations = item.get('conjugations', {})
        
        if not conjugations:
            return ConjugationResult(
                is_correct=False,
                user_input=user_input,
                correct_answer="",
                conjugation_form=form,
                feedback="No conjugation data available for this verb"
            )
        
        return self.verb_checker.check_conjugation(user_input, conjugations, form)
    
    def _check_adjective_conjugation(self, user_input: str, item: Dict[str, Any], 
                                   form: str) -> ConjugationResult:
        """Check adjective conjugation"""
        conjugations = item.get('conjugations', {})
        
        if not conjugations:
            return ConjugationResult(
                is_correct=False,
                user_input=user_input,
                correct_answer="",
                conjugation_form=form,
                feedback="No conjugation data available for this adjective"
            )
        
        return self.adjective_checker.check_conjugation(user_input, conjugations, form)
    
    def get_available_forms(self, item: Dict[str, Any]) -> List[str]:
        """Get available conjugation forms for an item"""
        conjugations = item.get('conjugations', {})
        if not conjugations:
            return []
        
        # Determine grammatical type
        conjugation_type = item.get('conjugation_type', '')
        grammatical_type = item.get('grammatical_type', '')
        
        if conjugation_type in ["i_adjective", "na_adjective", "i_adjective_irregular"]:
            return self.adjective_checker.get_supported_forms()
        elif grammatical_type in ["verb", "irregular_verb"] or 'dictionary' in conjugations:
            return self.verb_checker.get_supported_forms()
        
        return []
    
    def validate_conjugation_form(self, form: str, item: Dict[str, Any]) -> bool:
        """Check if a conjugation form is valid for the given item"""
        available_forms = self.get_available_forms(item)
        return form in available_forms


# Factory function for creating conjugation checkers
def create_conjugation_checker() -> ConjugationAnswerChecker:
    """Create a new conjugation answer checker instance"""
    return ConjugationAnswerChecker()


# Example usage and testing
if __name__ == "__main__":
    # Test the conjugation checker
    checker = create_conjugation_checker()
    
    # Test verb conjugation
    verb_item = {
        "english": "to eat",
        "kanji": "食べる",
        "hiragana": "たべる",
        "grammatical_type": "verb",
        "conjugations": {
            "dictionary": {"kanji": "食べる", "hiragana": "たべる"},
            "polite": {"kanji": "食べます", "hiragana": "たべます"},
            "negative": {"kanji": "食べない", "hiragana": "たべない"}
        }
    }
    
    # Test adjective conjugation
    adj_item = {
        "english": "fun",
        "kanji": "楽しい",
        "hiragana": "たのしい",
        "conjugation_type": "i_adjective",
        "conjugations": {
            "present": {"kanji": "楽しい", "hiragana": "たのしい"},
            "past": {"kanji": "楽しかった", "hiragana": "たのしかった"},
            "negative": {"kanji": "楽しくない", "hiragana": "たのしくない"}
        }
    }
    
    print("=== CONJUGATION CHECKER TEST ===")
    
    # Test verb
    result = checker.check_answer("たべます", verb_item, "polite", "verb")
    print(f"Verb test: {result.is_correct} - {result.feedback}")
    
    # Test adjective
    result = checker.check_answer("たのしかった", adj_item, "past", "i_adjective")
    print(f"Adjective test: {result.is_correct} - {result.feedback}")
    
    print("✅ Conjugation checker created successfully!")
