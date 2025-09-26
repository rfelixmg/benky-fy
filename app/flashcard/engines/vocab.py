"""Vocabulary flashcard engine implementation."""

import random
from typing import List, Dict, Any

from app.settings import get_user_settings
from .base import BaseFlashcardEngine
from ..models.item import FlashcardItem


class VocabFlashcardEngine(BaseFlashcardEngine):
    """Specialized engine for vocabulary flashcards with priority-based learning"""
    
    def __init__(self, json_filename: str, module_name: str = "vocab"):
        self.filename = json_filename
        self.module_name = module_name
        self._data = self.load_flashcards_from_json(json_filename)
    
    def get_filtered_data(self, priority_filter: str = "all") -> List[FlashcardItem]:
        """Get filtered data based on priority"""
        if priority_filter == "all":
            return self._data
        
        try:
            priority_num = int(priority_filter)
            return [item for item in self._data if item.priority and item.priority == priority_num]
        except (ValueError, TypeError):
            # If priority_filter is not a number, return all data
            return self._data
    
    def get_next(self, flashcard_styles: List[str] = None) -> FlashcardItem:
        """Get next flashcard with priority filtering"""
        settings = get_user_settings(self.module_name)
        priority_filter = settings.get("priority_filter", "all")
        learning_order = settings.get("learning_order", True)
        
        # Get filtered data
        filtered_data = self.get_filtered_data(priority_filter)
        
        if not filtered_data:
            # Fallback to all data if filtered data is empty
            filtered_data = self._data
        
        # Sort by learning order if enabled
        if learning_order:
            filtered_data = sorted(filtered_data, key=lambda x: getattr(x, 'learning_order', 999) if hasattr(x, 'learning_order') and x.learning_order is not None else 999)
        
        # Get random item from filtered data
        item = filtered_data[random.randint(0, len(filtered_data) - 1)]
        
        # Set prompt based on selected style
        if not flashcard_styles:
            flashcard_styles = ["hiragana"]
        
        selected_style = random.choice(flashcard_styles)
        
        if selected_style == "hiragana":
            item.prompt = item.hiragana
            item.prompt_script = "hiragana"
        elif selected_style == "kanji":
            item.prompt = item.kanji
            item.prompt_script = "kanji"
        elif selected_style == "katakana":
            item.prompt = item.katakana
            item.prompt_script = "katakana"
        elif selected_style == "english":
            item.prompt = item.english
            item.prompt_script = "english"
        
        return item
    
    def get_next_with_display_mode(self, settings: Dict[str, Any]) -> FlashcardItem:
        """Get next flashcard with priority filtering and new display modes"""
        priority_filter = settings.get("priority_filter", "all")
        learning_order = settings.get("learning_order", True)
        
        # Get filtered data
        filtered_data = self.get_filtered_data(priority_filter)
        
        if not filtered_data:
            # Fallback to all data if filtered data is empty
            filtered_data = self._data
        
        # Sort by learning order if enabled
        if learning_order:
            filtered_data = sorted(filtered_data, key=lambda x: getattr(x, 'learning_order', 999) if hasattr(x, 'learning_order') and x.learning_order is not None else 999)
        
        # Get random item from filtered data
        item = filtered_data[random.randint(0, len(filtered_data) - 1)]
        
        # Use parent class display mode logic
        return super().get_next_with_display_mode(settings)
