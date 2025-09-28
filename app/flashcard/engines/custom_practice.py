"""Custom Practice flashcard engine implementation."""

import json
import random
from typing import List, Dict, Any, Optional

from .base import BaseFlashcardEngine
from ..models.item import FlashcardItem
from ..utils.completion_tracker import completion_tracker


class CustomPracticeEngine(BaseFlashcardEngine):
    """Engine for custom practice sessions combining words from multiple completed modules"""
    
    def __init__(self, selected_modules: List[str], multi_word_count: int = 1, module_name: str = "custom_practice"):
        self.selected_modules = selected_modules
        self.multi_word_count = multi_word_count
        self.module_name = module_name
        self._data = self._load_words_from_modules(selected_modules)
        self._session_words_practiced = set()  # Track word indices already practiced in this session
    
    def _load_words_from_modules(self, module_names: List[str]) -> List[FlashcardItem]:
        """Load words from multiple completed modules"""
        all_words = []
        
        # Module configuration mapping
        module_config = {
            'hiragana': ('./datum/hiragana.json', 'vocab'),
            'katakana': ('./datum/katakana.json', 'katakana'),
            'verbs': ('./datum/verbs.json', 'verb'),
            'adjectives': ('./datum/adjectives.json', 'adjective'),
            'numbers_basic': ('./datum/numbers_basic.json', 'vocab'),
            'numbers_extended': ('./datum/numbers_extended.json', 'vocab'),
            'days_of_week': ('./datum/days_of_week.json', 'vocab'),
            'months_complete': ('./datum/months_complete.json', 'vocab'),
            'colors_basic': ('./datum/colors_basic.json', 'vocab'),
            'greetings_essential': ('./datum/greetings_essential.json', 'vocab'),
            'question_words': ('./datum/question_words.json', 'vocab'),
            'base_nouns': ('./datum/base_nouns.json', 'vocab'),
        }
        
        for module_name in module_names:
            if module_name not in module_config:
                continue
                
            data_file, engine_type = module_config[module_name]
            
            try:
                # Load words based on engine type
                if engine_type == 'katakana':
                    words = self._load_katakana_words(data_file, module_name)
                elif engine_type == 'verb':
                    words = self._load_verb_words(data_file, module_name)
                elif engine_type == 'adjective':
                    words = self._load_adjective_words(data_file, module_name)
                else:  # vocab
                    words = self._load_vocab_words(data_file, module_name)
                
                # Add module source information to each word
                for word in words:
                    word.source_module = module_name
                    word.module_type = engine_type
                
                all_words.extend(words)
                
            except Exception as e:
                print(f"Error loading words from {module_name}: {e}")
                continue
        
        return all_words
    
    def _load_vocab_words(self, path: str, module_name: str) -> List[FlashcardItem]:
        """Load vocabulary words from JSON file"""
        words = []
        with open(path, 'r', encoding='utf-8') as jsonfile:
            data = json.load(jsonfile)
            
            for idx, item_data in enumerate(data):
                word = FlashcardItem(
                    index=len(words),  # Use local index
                    kanji=item_data.get('kanji', ''),
                    hiragana=item_data.get('hiragana', ''),
                    katakana=item_data.get('katakana', ''),
                    romaji=item_data.get('romaji', ''),
                    english=item_data.get('english', ''),
                    prompt=item_data.get('hiragana', ''),
                    answer=item_data.get('english', ''),
                    prompt_script="hiragana",
                    answer_script="english",
                    priority=item_data.get('priority'),
                    learning_order=item_data.get('learning_order'),
                    category=item_data.get('category')
                )
                words.append(word)
        
        return words
    
    def _load_katakana_words(self, path: str, module_name: str) -> List[FlashcardItem]:
        """Load katakana words from JSON file"""
        words = []
        with open(path, 'r', encoding='utf-8') as jsonfile:
            data = json.load(jsonfile)
            
            for idx, item_data in enumerate(data):
                word = FlashcardItem(
                    index=len(words),
                    kanji='',
                    hiragana='',
                    katakana=item_data.get('katakana', ''),
                    romaji=item_data.get('romaji', ''),
                    english=item_data.get('english', ''),
                    prompt=item_data.get('katakana', ''),
                    answer=item_data.get('english', ''),
                    prompt_script="katakana",
                    answer_script="english",
                    priority=item_data.get('priority'),
                    learning_order=item_data.get('learning_order'),
                    category=item_data.get('category')
                )
                words.append(word)
        
        return words
    
    def _load_verb_words(self, path: str, module_name: str) -> List[FlashcardItem]:
        """Load verb words from JSON file"""
        words = []
        with open(path, 'r', encoding='utf-8') as jsonfile:
            data = json.load(jsonfile)
            
            for idx, item_data in enumerate(data):
                word = FlashcardItem(
                    index=len(words),
                    kanji=item_data.get('kanji', ''),
                    hiragana=item_data.get('hiragana', ''),
                    katakana=item_data.get('katakana', ''),
                    romaji=item_data.get('romaji', ''),
                    english=item_data.get('english', ''),
                    prompt=item_data.get('hiragana', ''),
                    answer=item_data.get('english', ''),
                    prompt_script="hiragana",
                    answer_script="english",
                    conjugation_type=item_data.get('conjugation_type'),
                    conjugations=item_data.get('conjugations'),
                    grammatical_type=item_data.get('grammatical_type'),
                    priority=item_data.get('priority'),
                    learning_order=item_data.get('learning_order'),
                    category=item_data.get('category')
                )
                words.append(word)
        
        return words
    
    def _load_adjective_words(self, path: str, module_name: str) -> List[FlashcardItem]:
        """Load adjective words from JSON file"""
        words = []
        with open(path, 'r', encoding='utf-8') as jsonfile:
            data = json.load(jsonfile)
            
            for idx, item_data in enumerate(data):
                word = FlashcardItem(
                    index=len(words),
                    kanji=item_data.get('kanji', ''),
                    hiragana=item_data.get('hiragana', ''),
                    katakana=item_data.get('katakana', ''),
                    romaji=item_data.get('romaji', ''),
                    english=item_data.get('english', ''),
                    prompt=item_data.get('hiragana', ''),
                    answer=item_data.get('english', ''),
                    prompt_script="hiragana",
                    answer_script="english",
                    conjugation_type=item_data.get('conjugation_type'),
                    conjugations=item_data.get('conjugations'),
                    grammatical_type=item_data.get('grammatical_type'),
                    priority=item_data.get('priority'),
                    learning_order=item_data.get('learning_order'),
                    category=item_data.get('category')
                )
                words.append(word)
        
        return words
    
    def get_next_multi_word(self, settings: Dict[str, Any]) -> List[FlashcardItem]:
        """Return 2-3 words for simultaneous display"""
        available_words = [word for word in self._data if word.index not in self._session_words_practiced]
        
        if not available_words:
            # Reset session if all words have been practiced
            self._session_words_practiced.clear()
            available_words = self._data.copy()
        
        # Select random words
        selected_count = min(self.multi_word_count, len(available_words))
        selected_words = random.sample(available_words, selected_count)
        
        # Mark words as practiced
        for word in selected_words:
            self._session_words_practiced.add(word.index)
        
        # Apply display mode to each word
        for word in selected_words:
            display_result = self.get_display_text(word, settings)
            word.prompt = display_result["text"]
            word.prompt_script = display_result["script"]
            word.display_mode = display_result["mode"]
            word.fallback_used = display_result["fallback_used"]
        
        return selected_words
    
    def get_next(self, flashcard_styles: List[str] = None) -> FlashcardItem:
        """Override base method to return single word for backward compatibility"""
        words = self.get_next_multi_word({"flashcard_styles": flashcard_styles or ["hiragana"]})
        return words[0] if words else None
    
    def get_next_with_display_mode(self, settings: Dict[str, Any]) -> FlashcardItem:
        """Override base method to return single word with display mode"""
        words = self.get_next_multi_word(settings)
        return words[0] if words else None
    
    def get_available_modules(self) -> List[Dict[str, Any]]:
        """Get list of available modules with completion status"""
        # Initialize demo data if not present
        if not completion_tracker.get_completion_data():
            completion_tracker.initialize_demo_data()
        
        return completion_tracker.get_available_modules_for_practice()
    
    def get_session_progress(self) -> Dict[str, Any]:
        """Get current session progress"""
        total_words = len(self._data)
        practiced_words = len(self._session_words_practiced)
        
        return {
            'total_words': total_words,
            'practiced_words': practiced_words,
            'remaining_words': total_words - practiced_words,
            'progress_percentage': (practiced_words / total_words * 100) if total_words > 0 else 0
        }
    
    def reset_session(self):
        """Reset the current practice session"""
        self._session_words_practiced.clear()
