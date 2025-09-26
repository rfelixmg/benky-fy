"""Settings plugin implementations."""

from .core import CoreSettingsPlugin
from .furigana import FuriganaSettingsPlugin
from .conjugation import ConjugationSettingsPlugin
from .vocabulary import VocabularySettingsPlugin

__all__ = [
    'CoreSettingsPlugin',
    'FuriganaSettingsPlugin',
    'ConjugationSettingsPlugin',
    'VocabularySettingsPlugin'
]
