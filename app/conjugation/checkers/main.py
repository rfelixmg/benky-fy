"""Main conjugation answer checker implementation."""

from typing import Dict, Any
from .verb import VerbConjugationChecker
from .adjective import AdjectiveConjugationChecker
from ..models.result import ConjugationResult


class ConjugationAnswerChecker:
    """Main conjugation answer checker that delegates to specific checkers"""
    
    def __init__(self):
        self.verb_checker = VerbConjugationChecker()
        self.adjective_checker = AdjectiveConjugationChecker()
    
    def check_answer(self, user_input: str, item_data: Dict[str, Any], 
                    conjugation_form: str, grammatical_type: str) -> ConjugationResult:
        """Check conjugation answer using appropriate checker"""
        
        # Determine which checker to use based on grammatical type
        if grammatical_type in ["verb", "godan", "ichidan"]:
            checker = self.verb_checker
        elif grammatical_type in ["i_adjective", "na_adjective"]:
            checker = self.adjective_checker
        else:
            # Default to verb checker
            checker = self.verb_checker
        
        # Extract conjugation data from item
        conjugations = item_data.get('conjugations', {})
        
        # Check the answer
        return checker.check_conjugation(user_input, conjugations, conjugation_form)
