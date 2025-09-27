"""Adjective conjugation checker implementation."""

from typing import Dict, List
from .base import BaseConjugationChecker
from ..models.result import ConjugationResult


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
        
        # Check if input matches
        is_correct = normalized_input == normalized_correct
        
        return ConjugationResult(
            is_correct=is_correct,
            user_input=user_input,
            correct_answer=correct_answer,
            conjugation_form=form,
            feedback="Correct!" if is_correct else f"Expected: {correct_answer}"
        )
