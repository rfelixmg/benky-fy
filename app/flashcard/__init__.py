"""
Flashcard Module - Refactored Architecture

This module provides a clean, modular architecture for flashcard functionality.
The original monolithic flashcard.py has been split into focused submodules:

- engines/: Core flashcard engine classes
- blueprints/: Flask blueprint management
- models/: Data models and structures
- utils/: Utility functions (romaji conversion, validation)
- factories/: Module creation factories

This refactoring improves maintainability, testability, and follows the Single
Responsibility Principle while maintaining backward compatibility.
"""

# Import all public APIs to maintain backward compatibility
from .engines.base import BaseFlashcardEngine
from .engines.verb import VerbFlashcardEngine
from .engines.adjective import AdjectiveFlashcardEngine
from .engines.vocab import VocabFlashcardEngine
from .engines.katakana import KatakanaFlashcardEngine
from .blueprints.flashcard_bp import FlashcardBlueprint
from .models.item import FlashcardItem
from .utils.romaji import romaji_to_hiragana, ROMAJI_TO_HIRAGANA
from .utils.validation import all_correct_logic
from .factories.module_factory import (
    create_flashcard_module,
    create_verb_flashcard_module,
    create_adjective_flashcard_module,
    create_vocab_flashcard_module,
    create_katakana_flashcard_module
)

# Export all public APIs
__all__ = [
    'BaseFlashcardEngine',
    'VerbFlashcardEngine', 
    'AdjectiveFlashcardEngine',
    'VocabFlashcardEngine',
    'KatakanaFlashcardEngine',
    'FlashcardBlueprint',
    'FlashcardItem',
    'romaji_to_hiragana',
    'ROMAJI_TO_HIRAGANA',
    'all_correct_logic',
    'create_flashcard_module',
    'create_verb_flashcard_module',
    'create_adjective_flashcard_module',
    'create_vocab_flashcard_module',
    'create_katakana_flashcard_module'
]
