"""Verb conjugation checker implementation."""

from typing import Dict, List
from .base import BaseConjugationChecker
from ..models.result import ConjugationResult


class VerbConjugationChecker(BaseConjugationChecker):
    """Answer checker for Japanese verb conjugations"""
    
    def __init__(self):
        self.supported_forms = [
            "dictionary", "polite", "negative", "polite_negative", "past", 
            "polite_past", "past_negative", "te_form", "potential", "volitional"
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
        
        # Check if input matches
        is_correct = normalized_input == normalized_correct
        
        return ConjugationResult(
            is_correct=is_correct,
            user_input=user_input,
            correct_answer=correct_answer,
            conjugation_form=form,
            feedback="Correct!" if is_correct else f"Expected: {correct_answer}"
        )
