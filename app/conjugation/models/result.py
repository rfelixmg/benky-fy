"""Conjugation result data model."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class ConjugationResult:
    """Result of a conjugation answer check"""
    is_correct: bool
    user_input: str
    correct_answer: str
    conjugation_form: str
    feedback: Optional[str] = None
