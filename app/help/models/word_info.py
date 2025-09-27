"""Word information data models for help functionality."""

from dataclasses import dataclass
from typing import Optional, List, Dict, Any


@dataclass
class WordInfo:
    """Data model representing detailed word information."""
    
    # Basic word data
    kanji: str
    hiragana: str
    katakana: str
    romaji: str
    english: str
    
    # Furigana information
    furigana_html: Optional[str] = None
    furigana_text: Optional[str] = None
    
    # Additional information
    part_of_speech: Optional[str] = None
    difficulty_level: Optional[str] = None
    frequency_rank: Optional[int] = None
    
    # Learning context
    module_name: Optional[str] = None
    item_index: Optional[int] = None
    
    # Extended information (for future use)
    etymology: Optional[str] = None
    stroke_count: Optional[int] = None
    radicals: Optional[List[str]] = None
    examples: Optional[List[str]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'kanji': self.kanji,
            'hiragana': self.hiragana,
            'katakana': self.katakana,
            'romaji': self.romaji,
            'english': self.english,
            'furigana_html': self.furigana_html,
            'furigana_text': self.furigana_text,
            'part_of_speech': self.part_of_speech,
            'difficulty_level': self.difficulty_level,
            'frequency_rank': self.frequency_rank,
            'module_name': self.module_name,
            'item_index': self.item_index,
            'etymology': self.etymology,
            'stroke_count': self.stroke_count,
            'radicals': self.radicals,
            'examples': self.examples
        }
