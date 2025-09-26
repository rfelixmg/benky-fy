"""
Conjugation Answer Checker System

This module provides answer checking functionality for Japanese verb and adjective conjugations.
It supports different grammatical types and validates user input against correct conjugations.

Refactored from monolithic conjugation_checker.py into focused submodules:
- models/: Data models and result structures
- checkers/: Conjugation checker implementations
- utils/: Utility functions and factory methods
"""

# Import all public APIs to maintain backward compatibility
from .models.result import ConjugationResult
from .checkers.base import BaseConjugationChecker
from .checkers.verb import VerbConjugationChecker
from .checkers.adjective import AdjectiveConjugationChecker
from .checkers.main import ConjugationAnswerChecker
from .utils.factory import create_conjugation_checker

# Export all public APIs
__all__ = [
    'ConjugationResult',
    'BaseConjugationChecker',
    'VerbConjugationChecker',
    'AdjectiveConjugationChecker',
    'ConjugationAnswerChecker',
    'create_conjugation_checker'
]
