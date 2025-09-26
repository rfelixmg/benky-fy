"""Verb flashcard engine implementation."""

import random
from typing import List, Dict, Any, Tuple

from app.settings import get_user_settings
from app.conjugation_checker import create_conjugation_checker
from .base import BaseFlashcardEngine
from ..models.item import FlashcardItem


class VerbFlashcardEngine(BaseFlashcardEngine):
    """Specialized engine for Japanese verbs with furigana support"""
    
    def __init__(self, json_filename: str, module_name: str = "verbs"):
        self.filename = json_filename
        self.module_name = module_name
        self._data = self.load_flashcards_from_json(json_filename)
    
    def generate_conjugation_prompt(self, item: FlashcardItem, conjugation_form: str, prompt_style: str) -> Tuple[str, str]:
        """Generate a conjugation prompt for the given item and form"""
        if prompt_style == "english":
            prompt = f"Conjugate '{item.english}' in {conjugation_form} form"
            prompt_script = "conjugation_english"
        else:  # hiragana
            prompt = f"Conjugate '{item.hiragana}' in {conjugation_form} form"
            prompt_script = "conjugation_hiragana"
        
        return prompt, prompt_script
    
    def get_next(self, flashcard_styles: List[str] = None) -> FlashcardItem:
        """Get next flashcard with conjugation support"""
        settings = get_user_settings(self.module_name)
        
        # Check if conjugation mode is enabled
        if settings.get("conjugation_mode", False) and settings.get("conjugation_forms"):
            # Generate conjugation prompt
            item = self._data[random.randint(0, len(self._data) - 1)]
            conjugation_form = random.choice(settings["conjugation_forms"])
            prompt_style = settings.get("conjugation_prompt_style", "english")
            
            # Generate conjugation prompt
            prompt, prompt_script = self.generate_conjugation_prompt(item, conjugation_form, prompt_style)
            
            # Set conjugation-specific fields
            item.prompt = prompt
            item.prompt_script = prompt_script
            item.answer = conjugation_form  # Store the form for answer checking
            
            return item
        else:
            # Use parent class method for regular flashcards
            return super().get_next(flashcard_styles)
    
    def get_next_with_display_mode(self, settings: Dict[str, Any]) -> FlashcardItem:
        """Get next flashcard with conjugation support and new display modes"""
        # Check if conjugation mode is enabled
        if settings.get("conjugation_mode", False) and settings.get("conjugation_forms"):
            # Generate conjugation prompt
            item = self._data[random.randint(0, len(self._data) - 1)]
            conjugation_form = random.choice(settings["conjugation_forms"])
            prompt_style = settings.get("conjugation_prompt_style", "english")
            
            # Generate conjugation prompt
            prompt, prompt_script = self.generate_conjugation_prompt(item, conjugation_form, prompt_style)
            
            # Set conjugation-specific fields
            item.prompt = prompt
            item.prompt_script = prompt_script
            item.answer = conjugation_form  # Store the form for answer checking
            
            return item
        else:
            # Use parent class method for regular flashcards
            return super().get_next_with_display_mode(settings)
    
    def check_conjugation_answer(self, user_input: str, item: FlashcardItem, conjugation_form: str) -> dict:
        """Check conjugation answer using the conjugation checker"""
        checker = create_conjugation_checker()
        
        # Determine grammatical type
        grammatical_type = item.grammatical_type or item.conjugation_type or "verb"
        
        # Check the answer
        result = checker.check_answer(user_input, item.__dict__, conjugation_form, grammatical_type)
        
        return {
            "user_input": result.user_input,
            "correct_answer": result.correct_answer,
            "is_correct": result.is_correct,
            "feedback": result.feedback,
            "conjugation_form": result.conjugation_form
        }
