"""Katakana flashcard engine implementation."""

import json
import random
from typing import List, Dict, Any

from app.settings import get_user_settings
from .base import BaseFlashcardEngine
from ..models.item import FlashcardItem


class KatakanaFlashcardEngine(BaseFlashcardEngine):
    """Specialized engine for katakana flashcards"""
    
    def __init__(self, json_filename: str, module_name: str = "katakana"):
        self.filename = json_filename
        self.module_name = module_name
        self._data = self.load_flashcards_from_json(json_filename)
    
    def load_flashcards_from_json(self, path: str) -> List[FlashcardItem]:
        """Load flashcards from katakana-specific JSON format"""
        flashcards = []
        with open(path, 'r', encoding='utf-8') as jsonfile:
            katakana_data = json.load(jsonfile)
            
            for idx, item_data in enumerate(katakana_data):
                item = FlashcardItem(
                    index=idx,
                    kanji='',  # Katakana doesn't have kanji
                    hiragana='',  # Katakana doesn't have hiragana
                    katakana=item_data.get('katakana', ''),
                    romaji=item_data.get('romaji', ''),
                    english=item_data.get('english', ''),
                    prompt=item_data.get('katakana', ''),  # Default prompt is katakana
                    answer=item_data.get('english', ''),    # Default answer is english
                    prompt_script="katakana",               # Default script
                    answer_script="english",
                    # Vocabulary support
                    priority=item_data.get('priority'),
                    learning_order=item_data.get('learning_order'),
                    category=item_data.get('category')
                )
                flashcards.append(item)
        
        return flashcards
    
    def get_next(self, flashcard_styles: List[str] = None) -> FlashcardItem:
        """Get next flashcard with katakana-specific logic"""
        if not flashcard_styles:
            flashcard_styles = ["katakana"]  # Default to katakana for katakana module
        
        # Get random card
        item = self._data[random.randint(0, len(self._data) - 1)]
        
        # Set prompt based on selected style
        selected_style = random.choice(flashcard_styles)
        
        if selected_style == "katakana":
            item.prompt = item.katakana
            item.prompt_script = "katakana"
        elif selected_style == "romaji":
            item.prompt = item.romaji
            item.prompt_script = "romaji"
        elif selected_style == "english":
            item.prompt = item.english
            item.prompt_script = "english"
        else:
            # Fallback to katakana
            item.prompt = item.katakana
            item.prompt_script = "katakana"
        
        return item
    
    def get_next_with_display_mode(self, settings: Dict[str, Any]) -> FlashcardItem:
        """Get next flashcard using katakana-specific display mode logic"""
        # Get random card
        item = self._data[random.randint(0, len(self._data) - 1)]
        
        # Use katakana-specific display text logic
        display_result = self.get_display_text(item, settings)
        
        # Set prompt based on display result
        item.prompt = display_result["text"]
        item.prompt_script = display_result["script"]
        
        # Store display metadata for frontend use
        item.display_mode = display_result["mode"]
        item.fallback_used = display_result["fallback_used"]
        
        return item
    
    def get_display_text(self, item: FlashcardItem, settings: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get display text based on katakana-specific display mode constraints.
        Returns dict with 'text', 'script', 'mode', and 'fallback_used' keys.
        """
        display_mode = settings.get("display_mode", "kana")
        kana_type = settings.get("kana_type", "katakana")  # Default to katakana for katakana module
        proportions = settings.get("proportions", {})
        
        # Handle weighted mode by selecting a specific mode first
        if display_mode == "weighted" and proportions:
            display_mode = self._select_weighted_display_mode(proportions)
        
        result = {
            "text": "",
            "script": "",
            "mode": display_mode,
            "fallback_used": False
        }
        
        if display_mode == "kanji":
            # Katakana doesn't have kanji, fallback to katakana
            if item.katakana and item.katakana.strip():
                result["text"] = item.katakana
                result["script"] = "katakana"
                result["fallback_used"] = True
            else:
                result["text"] = "N/A"
                result["script"] = "error"
                print(f"Warning: Missing katakana content for kanji mode: {item}")
        
        elif display_mode == "kana":
            # For katakana module, always show katakana regardless of kana_type setting
            if item.katakana and item.katakana.strip():
                result["text"] = item.katakana
                result["script"] = "katakana"
            else:
                result["text"] = "N/A"
                result["script"] = "error"
                print(f"Warning: Missing katakana content: {item}")
        
        elif display_mode == "kanji_furigana":
            # Katakana doesn't have kanji or furigana, fallback to katakana
            if item.katakana and item.katakana.strip():
                result["text"] = item.katakana
                result["script"] = "katakana"
                result["fallback_used"] = True
            else:
                result["text"] = "N/A"
                result["script"] = "error"
                print(f"Warning: Missing katakana content for kanji_furigana mode: {item}")
        
        elif display_mode == "english":
            # Show English only
            if item.english and item.english.strip():
                result["text"] = item.english
                result["script"] = "english"
            else:
                result["text"] = "N/A"
                result["script"] = "error"
                print(f"Warning: Missing English content: {item}")
        
        else:
            # Unknown mode, fallback to katakana
            if item.katakana and item.katakana.strip():
                result["text"] = item.katakana
                result["script"] = "katakana"
                result["fallback_used"] = True
            else:
                result["text"] = "N/A"
                result["script"] = "error"
                print(f"Warning: Unknown display mode '{display_mode}' and missing fallback content: {item}")
        
        return result
    
    def _select_weighted_display_mode(self, proportions: Dict[str, float]) -> str:
        """Select display mode based on weighted proportions"""
        # Create weighted list
        weighted_modes = []
        for mode, weight in proportions.items():
            weighted_modes.extend([mode] * int(weight * 100))  # Scale to integers
        
        # Select random mode from weighted list
        if weighted_modes:
            return random.choice(weighted_modes)
        else:
            return "kana"  # Fallback
    
    def check_answers_with_input_modes(self, user_inputs: dict, item: FlashcardItem, input_modes: List[str]) -> dict:
        """Check answers using katakana-specific input modes"""
        results = {}
        
        # Handle case where input_modes is empty or None
        if not input_modes:
            input_modes = ["english"]  # Default fallback
        
        for mode in input_modes:
            user_input_raw = user_inputs.get(f"user_{mode}", "").strip()
            
            # Handle empty input - treat as incorrect for mixed feedback system
            if not user_input_raw:
                # Get the correct answer for this mode
                correct_answer = self._get_correct_answer_for_mode(mode, item)
                results[mode] = {
                    "user_input": "",
                    "correct_answer": correct_answer,
                    "is_correct": False,
                    "skipped": False
                }
                continue
            
            if mode == "katakana":
                correct_answer = item.katakana
                is_correct = user_input_raw == correct_answer if user_input_raw else False
                
                results[mode] = {
                    "user_input": user_input_raw,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct
                }
            elif mode == "romaji":
                user_input = user_input_raw.lower()
                correct_answer = item.romaji.lower() if item.romaji else ""
                is_correct = user_input == correct_answer if user_input_raw else False
                
                results[mode] = {
                    "user_input": user_input_raw,
                    "correct_answer": item.romaji if item.romaji else "",
                    "is_correct": is_correct
                }
            elif mode == "english":
                user_input = user_input_raw.lower().strip()
                correct_answers_text = item.english
                
                is_correct = self._check_english_answer(user_input, correct_answers_text)
                
                results[mode] = {
                    "user_input": user_input_raw,
                    "correct_answer": correct_answers_text,
                    "is_correct": is_correct
                }
            # Skip hiragana and kanji modes for katakana module
            elif mode in ["hiragana", "kanji"]:
                continue
        
        return results
    
    def _get_correct_answer_for_mode(self, mode: str, item: FlashcardItem) -> str:
        """Get the correct answer for a specific input mode"""
        if mode == "katakana":
            return item.katakana
        elif mode == "romaji":
            return item.romaji if item.romaji else ""
        elif mode == "english":
            return item.english
        else:
            return ""
    
    def _check_english_answer(self, user_input: str, correct_answers_text: str) -> bool:
        """Check English answer with flexible matching"""
        if not user_input:
            return False
        
        # Direct comparison (case-insensitive)
        return user_input == correct_answers_text.lower()
