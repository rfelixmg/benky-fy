"""Factory functions for creating flashcard modules."""

from ..engines.base import BaseFlashcardEngine
from ..engines.verb import VerbFlashcardEngine
from ..engines.adjective import AdjectiveFlashcardEngine
from ..engines.vocab import VocabFlashcardEngine
from ..engines.katakana import KatakanaFlashcardEngine
from ..blueprints.flashcard_bp import FlashcardBlueprint


def create_flashcard_module(module_name: str, csv_filename: str):
    """Factory function to create a complete flashcard module"""
    engine = BaseFlashcardEngine(csv_filename, module_name)
    blueprint_creator = FlashcardBlueprint(module_name, engine)
    return blueprint_creator.blueprint


def create_verb_flashcard_module(module_name: str, json_filename: str):
    """Factory function to create a verb flashcard module with furigana support"""
    engine = VerbFlashcardEngine(json_filename, module_name)
    blueprint_creator = FlashcardBlueprint(module_name, engine)
    return blueprint_creator.blueprint


def create_adjective_flashcard_module(module_name: str, json_filename: str):
    """Factory function to create an adjective flashcard module with conjugation support"""
    engine = AdjectiveFlashcardEngine(json_filename, module_name)
    blueprint_creator = FlashcardBlueprint(module_name, engine)
    return blueprint_creator.blueprint


def create_vocab_flashcard_module(module_name: str, json_filename: str):
    """Factory function to create a vocabulary flashcard module with priority-based learning"""
    engine = VocabFlashcardEngine(json_filename, module_name)
    blueprint_creator = FlashcardBlueprint(module_name, engine)
    return blueprint_creator.blueprint


def create_katakana_flashcard_module(module_name: str, json_filename: str):
    """Factory function to create a katakana flashcard module with katakana-specific logic"""
    engine = KatakanaFlashcardEngine(json_filename, module_name)
    blueprint_creator = FlashcardBlueprint(module_name, engine)
    return blueprint_creator.blueprint
