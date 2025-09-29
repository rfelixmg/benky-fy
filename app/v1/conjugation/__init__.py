"""Conjugation module initialization."""

from .checkers.main import ConjugationAnswerChecker

def create_conjugation_checker():
    """Create a new conjugation checker instance."""
    return ConjugationAnswerChecker()