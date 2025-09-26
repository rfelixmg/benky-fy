"""Base flashcard engine implementation."""

import csv
import json
import random
from typing import List, Dict, Any

from ..models.item import FlashcardItem
from ..utils.romaji import romaji_to_hiragana


class BaseFlashcardEngine:
    """Base class for flashcard engines that can be extended for different modules"""
    
    def __init__(self, filename: str, module_name: str = "flashcard"):
        self.filename = filename
        self.module_name = module_name
        self._data = self.load_flashcards_from_csv(filename)
    
    def __getitem__(self, index: int) -> FlashcardItem:
        """Allow direct indexing like engine[index]"""
        return self._data[index]
    
    def load_flashcards_from_csv(self, path: str) -> List[FlashcardItem]:
        """Load flashcards from CSV file - can be overridden by subclasses"""
        flashcards = []
        with open(path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for idx, row in enumerate(reader):
                item = FlashcardItem(
                    index=idx,
                    kanji=row["Kanji"],
                    hiragana=row["Hiragana"],
                    katakana=row["Katakana"],
                    romaji=row["Romaji"],
                    english=row["English"],
                    prompt=row["Hiragana"],          # default prompt
                    answer=row["English"],           # default answer
                    prompt_script="hiragana",        # default script
                    answer_script="english"
                )
                flashcards.append(item)
        return flashcards
    
    def load_flashcards_from_json(self, path: str) -> List[FlashcardItem]:
        """Load flashcards from enhanced JSON format with furigana support"""
        flashcards = []
        with open(path, 'r', encoding='utf-8') as jsonfile:
            verbs = json.load(jsonfile)
            
            for idx, verb in enumerate(verbs):
                # Extract furigana data if available
                kanji_analysis = verb.get('kanji_analysis', {})
                furigana_html = kanji_analysis.get('furigana_html', '')
                furigana_text = kanji_analysis.get('furigana_text', '')
                
                item = FlashcardItem(
                    index=idx,
                    kanji=verb.get('kanji', ''),
                    hiragana=verb.get('hiragana', ''),
                    katakana=verb.get('katakana', ''),  # May not exist in verbs.json
                    romaji=verb.get('romaji', ''),
                    english=verb.get('english', ''),
                    prompt=verb.get('hiragana', ''),    # default prompt
                    answer=verb.get('english', ''),     # default answer
                    prompt_script="hiragana",           # default script
                    answer_script="english",
                    # Enhanced furigana fields
                    kanji_analysis=kanji_analysis,
                    furigana_html=furigana_html,
                    furigana_text=furigana_text,
                    # Conjugation support
                    conjugation_type=verb.get('conjugation_type'),
                    conjugations=verb.get('conjugations'),
                    grammatical_type=verb.get('grammatical_type'),
                    # Vocabulary support
                    priority=verb.get('priority'),
                    learning_order=verb.get('learning_order'),
                    category=verb.get('category')
                )
                flashcards.append(item)
        
        return flashcards
    
    def get_next(self, flashcard_styles: List[str] = None) -> FlashcardItem:
        """Get next flashcard with specified prompt style(s) - can be overridden"""
        if not flashcard_styles:
            flashcard_styles = ["hiragana"]  # default
        
        # Get random card
        item = self._data[random.randint(0, len(self._data) - 1)]
        
        # Set prompt based on selected style
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
        """Get next flashcard using the new display mode system"""
        # Get random card
        item = self._data[random.randint(0, len(self._data) - 1)]
        
        # Use the new display text logic
        display_result = self.get_display_text(item, settings)
        
        # Set prompt based on display result
        item.prompt = display_result["text"]
        item.prompt_script = display_result["script"]
        
        # Store display metadata for frontend use
        item.display_mode = display_result["mode"]
        item.fallback_used = display_result["fallback_used"]
        
        return item
    
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
    
    def get_display_text(self, item: FlashcardItem, settings: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get display text based on display mode constraints.
        Returns dict with 'text', 'script', 'mode', and 'fallback_used' keys.
        """
        display_mode = settings.get("display_mode", "kana")
        kana_type = settings.get("kana_type", "hiragana")
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
            # Show kanji only, fallback to hiragana if no kanji
            if item.kanji and item.kanji.strip():
                result["text"] = item.kanji
                result["script"] = "kanji"
            elif item.hiragana and item.hiragana.strip():
                result["text"] = item.hiragana
                result["script"] = "hiragana"
                result["fallback_used"] = True
            else:
                result["text"] = "N/A"
                result["script"] = "error"
                print(f"Warning: Missing display content for kanji mode: {item}")
        
        elif display_mode == "kana":
            # Show kana based on kana_type setting
            if kana_type == "hiragana":
                if item.hiragana and item.hiragana.strip():
                    result["text"] = item.hiragana
                    result["script"] = "hiragana"
                else:
                    result["text"] = "N/A"
                    result["script"] = "error"
                    print(f"Warning: Missing hiragana content: {item}")
            elif kana_type == "katakana":
                if item.katakana and item.katakana.strip() and item.katakana.strip() not in ['–', '']:
                    result["text"] = item.katakana
                    result["script"] = "katakana"
                else:
                    # Fallback to hiragana if no katakana
                    if item.hiragana and item.hiragana.strip():
                        result["text"] = item.hiragana
                        result["script"] = "hiragana"
                        result["fallback_used"] = True
                    else:
                        result["text"] = "N/A"
                        result["script"] = "error"
                        print(f"Warning: Missing katakana content: {item}")
            else:  # mixed (future)
                # For now, default to hiragana
                if item.hiragana and item.hiragana.strip():
                    result["text"] = item.hiragana
                    result["script"] = "hiragana"
                else:
                    result["text"] = "N/A"
                    result["script"] = "error"
                    print(f"Warning: Missing hiragana content for mixed mode: {item}")
        
        elif display_mode == "kanji_furigana":
            # Show kanji with furigana, fallback to hiragana if no kanji
            if item.kanji and item.kanji.strip():
                if item.furigana_html and item.furigana_html.strip():
                    result["text"] = item.furigana_html
                    result["script"] = "kanji_furigana"
                else:
                    # Kanji without furigana - just show kanji
                    result["text"] = item.kanji
                    result["script"] = "kanji"
            elif item.hiragana and item.hiragana.strip():
                result["text"] = item.hiragana
                result["script"] = "hiragana"
                result["fallback_used"] = True
            else:
                result["text"] = "N/A"
                result["script"] = "error"
                print(f"Warning: Missing display content for kanji_furigana mode: {item}")
        
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
            # Unknown mode, fallback to hiragana
            if item.hiragana and item.hiragana.strip():
                result["text"] = item.hiragana
                result["script"] = "hiragana"
                result["fallback_used"] = True
            else:
                result["text"] = "N/A"
                result["script"] = "error"
                print(f"Warning: Unknown display mode '{display_mode}' and missing fallback content: {item}")
        
        return result
    
    def check_answers_with_input_modes(self, user_inputs: dict, item: FlashcardItem, input_modes: List[str]) -> dict:
        """Check answers using the new input modes system"""
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
                    "skipped": False  # Changed: empty fields are not skipped, they're incorrect
                }
                continue
            
            if mode == "hiragana":
                correct_answer = item.hiragana
                # Check if input is hiragana or if it's romaji that needs conversion
                is_correct = self._check_hiragana_input(user_input_raw, correct_answer)
                
                results[mode] = {
                    "user_input": user_input_raw,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct
                }
            elif mode == "romaji":
                user_input = user_input_raw.lower()
                correct_answer = item.romaji.lower() if item.romaji else ""
                # Check if input is romaji or if it's hiragana that needs conversion
                is_correct = self._check_romaji_input(user_input_raw, item.romaji if item.romaji else "")
                
                results[mode] = {
                    "user_input": user_input_raw,
                    "correct_answer": item.romaji if item.romaji else "",
                    "is_correct": is_correct
                }
            elif mode == "kanji":
                user_input = user_input_raw.lower()
                correct_answer = item.kanji.lower()
                is_correct = user_input == correct_answer if user_input_raw else False
                
                results[mode] = {
                    "user_input": user_input_raw,
                    "correct_answer": item.kanji,
                    "is_correct": is_correct
                }
            elif mode == "katakana":
                # Skip if katakana is not available
                if not item.katakana or item.katakana.strip() in ['–', '']:
                    continue
                    
                user_input = user_input_raw.lower()
                correct_answer = item.katakana.lower()
                is_correct = user_input == correct_answer if user_input_raw else False
                
                results[mode] = {
                    "user_input": user_input_raw,
                    "correct_answer": item.katakana,
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
        
        return results
    
    def _get_correct_answer_for_mode(self, mode: str, item: FlashcardItem) -> str:
        """Get the correct answer for a specific input mode"""
        if mode == "hiragana":
            return item.hiragana
        elif mode == "romaji":
            return item.romaji if item.romaji else ""
        elif mode == "kanji":
            return item.kanji
        elif mode == "katakana":
            return item.katakana if item.katakana and item.katakana.strip() not in ['–', ''] else ""
        elif mode == "english":
            return item.english
        else:
            return ""
    
    def _check_hiragana_input(self, user_input: str, correct_hiragana: str) -> bool:
        """Check hiragana input, handling both hiragana and romaji inputs"""
        if not user_input or not correct_hiragana:
            return False
        
        # Direct hiragana comparison
        if user_input == correct_hiragana:
            return True
        
        # Try romaji to hiragana conversion
        try:
            converted_hiragana = romaji_to_hiragana(user_input.lower())
            return converted_hiragana == correct_hiragana
        except ImportError:
            # Fallback if conversion not available
            return False
    
    def _check_romaji_input(self, user_input: str, correct_romaji: str) -> bool:
        """Check romaji input, handling both romaji and hiragana inputs"""
        if not user_input or not correct_romaji:
            return False
        
        # Direct romaji comparison
        if user_input.lower() == correct_romaji.lower():
            return True
        
        # Try hiragana to romaji conversion (if needed)
        # For now, just do direct comparison
        return False
    
    def _check_english_answer(self, user_input: str, correct_answers_text: str) -> bool:
        """
        Enhanced English answer checking that handles multiple formats:
        1. Multiple meanings separated by " / " (e.g., "simple / easy")
        2. Comma-separated meanings (e.g., "tough, serious")
        3. Verb variations with/without "to" (e.g., "to look" accepts "look")
        4. Flexible matching for common variations
        """
        if not user_input:
            return False
        
        # First, try the original " / " format
        if " / " in correct_answers_text:
            correct_answers = [answer.strip().lower() for answer in correct_answers_text.split(" / ")]
            if user_input in correct_answers:
                return True
        
        # Handle comma-separated meanings (e.g., "tough, serious")
        if "," in correct_answers_text and " / " not in correct_answers_text:
            correct_answers = [answer.strip().lower() for answer in correct_answers_text.split(",")]
            if user_input in correct_answers:
                return True
        
        # Handle verb variations (with/without "to")
        # Check if the correct answer starts with "to " and user input doesn't
        if correct_answers_text.lower().startswith("to "):
            verb_without_to = correct_answers_text[3:].strip().lower()  # Remove "to " prefix
            if user_input == verb_without_to:
                return True
        
        # Check if user input starts with "to " but correct answer doesn't
        if user_input.startswith("to "):
            verb_without_to = user_input[3:].strip()  # Remove "to " prefix
            if verb_without_to == correct_answers_text.lower():
                return True
        
        # Handle multiple verb forms in comma-separated format
        if "," in correct_answers_text:
            answers = [answer.strip().lower() for answer in correct_answers_text.split(",")]
            for answer in answers:
                # Check exact match
                if user_input == answer:
                    return True
                # Check verb variations
                if answer.startswith("to ") and user_input == answer[3:].strip():
                    return True
                if user_input.startswith("to ") and answer == user_input[3:].strip():
                    return True
        
        # Fallback: exact match (case-insensitive)
        return user_input == correct_answers_text.lower()
