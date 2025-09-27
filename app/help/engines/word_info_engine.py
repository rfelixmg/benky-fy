"""Word information engine for help functionality."""

import re
from typing import Optional, Dict, Any
from ..models.word_info import WordInfo


class WordInfoEngine:
    """Engine for processing and analyzing word information."""
    
    def __init__(self):
        self.furigana_pattern = re.compile(r'<ruby>(.*?)<rt>(.*?)</rt></ruby>')
    
    def extract_word_info(self, item_data: Dict[str, Any], module_name: str = None, item_index: int = None) -> WordInfo:
        """
        Extract comprehensive word information from flashcard item data.
        
        Args:
            item_data: Raw item data from flashcard engine
            module_name: Name of the module (e.g., 'verbs', 'adjectives')
            item_index: Index of the item in the dataset
            
        Returns:
            WordInfo object with extracted information
        """
        # Extract basic information
        kanji = item_data.get('kanji', '')
        hiragana = item_data.get('hiragana', '')
        katakana = item_data.get('katakana', '')
        romaji = item_data.get('romaji', '')
        english = item_data.get('english', '')
        
        # Extract furigana information
        furigana_html = item_data.get('furigana_html', '')
        furigana_text = self._extract_furigana_text(furigana_html)
        
        # Determine part of speech based on module
        part_of_speech = self._determine_part_of_speech(module_name)
        
        # Determine difficulty level
        difficulty_level = self._determine_difficulty_level(kanji, hiragana, english)
        
        return WordInfo(
            kanji=kanji,
            hiragana=hiragana,
            katakana=katakana,
            romaji=romaji,
            english=english,
            furigana_html=furigana_html,
            furigana_text=furigana_text,
            part_of_speech=part_of_speech,
            difficulty_level=difficulty_level,
            module_name=module_name,
            item_index=item_index
        )
    
    def _extract_furigana_text(self, furigana_html: str) -> str:
        """Extract furigana text from HTML ruby tags."""
        if not furigana_html:
            return ''
        
        matches = self.furigana_pattern.findall(furigana_html)
        if matches:
            return ''.join([furigana for _, furigana in matches])
        
        return ''
    
    def _determine_part_of_speech(self, module_name: str) -> Optional[str]:
        """Determine part of speech based on module name."""
        if not module_name:
            return None
        
        pos_mapping = {
            'verbs': 'verb',
            'adjectives': 'adjective',
            'nouns': 'noun',
            'adverbs': 'adverb',
            'particles': 'particle',
            'conjunctions': 'conjunction'
        }
        
        return pos_mapping.get(module_name.lower())
    
    def _determine_difficulty_level(self, kanji: str, hiragana: str, english: str) -> str:
        """Determine difficulty level based on content."""
        if not kanji and not hiragana:
            return 'unknown'
        
        # Simple heuristic based on kanji presence and length
        if not kanji:
            return 'beginner'  # Only hiragana/katakana
        elif len(kanji) <= 2:
            return 'intermediate'  # Short kanji words
        else:
            return 'advanced'  # Longer kanji words
    
    def get_display_info(self, word_info: WordInfo) -> Dict[str, Any]:
        """
        Get formatted display information for the help modal.
        
        Args:
            word_info: WordInfo object
            
        Returns:
            Dictionary with formatted display data
        """
        display_info = {
            'kanji': {
                'label': 'Kanji',
                'value': word_info.kanji,
                'visible': bool(word_info.kanji),
                'class': 'kanji'
            },
            'furigana': {
                'label': 'Furigana',
                'value': word_info.furigana_text,
                'visible': bool(word_info.furigana_text),
                'class': 'furigana'
            },
            'hiragana': {
                'label': 'Hiragana',
                'value': word_info.hiragana,
                'visible': bool(word_info.hiragana) and not word_info.furigana_text,
                'class': 'hiragana'
            },
            'english': {
                'label': 'English',
                'value': word_info.english,
                'visible': bool(word_info.english),
                'class': 'english'
            },
            'part_of_speech': {
                'label': 'Part of Speech',
                'value': word_info.part_of_speech,
                'visible': bool(word_info.part_of_speech),
                'class': 'part-of-speech'
            },
            'difficulty': {
                'label': 'Difficulty',
                'value': word_info.difficulty_level,
                'visible': bool(word_info.difficulty_level),
                'class': 'difficulty'
            }
        }
        
        return display_info
