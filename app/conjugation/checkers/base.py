"""Base conjugation checker implementation."""

from abc import ABC, abstractmethod
from typing import Dict, List
from ..models.result import ConjugationResult


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
