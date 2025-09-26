"""Conjugation checker factory function."""

from ..checkers.main import ConjugationAnswerChecker


def create_conjugation_checker() -> ConjugationAnswerChecker:
    """Create a new conjugation answer checker instance"""
    return ConjugationAnswerChecker()
