"""Flashcard module factory functions."""

from .module_factory import (
    create_flashcard_module,
    create_verb_flashcard_module,
    create_adjective_flashcard_module,
    create_vocab_flashcard_module,
    create_katakana_flashcard_module,
    create_custom_practice_module
)

__all__ = [
    'create_flashcard_module',
    'create_verb_flashcard_module',
    'create_adjective_flashcard_module',
    'create_vocab_flashcard_module',
    'create_katakana_flashcard_module',
    'create_custom_practice_module'
]
