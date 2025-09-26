"""FlashcardItem data model."""

from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class FlashcardItem:
    """Data model representing a single flashcard item."""
    
    index: int
    kanji: str
    hiragana: str
    katakana: str
    romaji: str
    english: str
    prompt: str
    answer: str
    prompt_script: str  # e.g., hiragana, katakana, kanji, romaji, english
    answer_script: str
    
    # Enhanced fields for furigana support
    kanji_analysis: Optional[Dict[str, Any]] = None
    furigana_html: Optional[str] = None
    furigana_text: Optional[str] = None
    
    # Conjugation support
    conjugation_type: Optional[str] = None
    conjugations: Optional[Dict[str, Any]] = None
    grammatical_type: Optional[str] = None
    
    # Vocabulary support
    priority: Optional[int] = None
    learning_order: Optional[int] = None
    category: Optional[str] = None
