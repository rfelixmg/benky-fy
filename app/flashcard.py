import csv
import json
import random
from dataclasses import dataclass
from typing import Optional, Tuple, List, Dict, Any

from flask import Blueprint, render_template, request, session, redirect, url_for
from app.auth import login_required, get_current_user


# Romaji to Hiragana conversion mapping
ROMAJI_TO_HIRAGANA = {
    'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
    'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
    'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
    'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
    'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
    'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
    'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
    'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
    'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
    'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
    'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
    'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
    'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
    'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
    'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を', 'n': 'ん',
    # Common combinations
    'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
    'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
    'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
    'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
    'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
    'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
    'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
    'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
    'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
    'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
    'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
}


def romaji_to_hiragana(romaji_text: str) -> str:
    """Convert romaji text to hiragana"""
    if not romaji_text:
        return ""
    
    romaji_text = romaji_text.lower().strip()
    result = ""
    i = 0
    
    while i < len(romaji_text):
        # Try longer combinations first (3 chars, then 2, then 1)
        found = False
        for length in [3, 2, 1]:
            if i + length <= len(romaji_text):
                substring = romaji_text[i:i + length]
                if substring in ROMAJI_TO_HIRAGANA:
                    result += ROMAJI_TO_HIRAGANA[substring]
                    i += length
                    found = True
                    break
        
        if not found:
            # If no mapping found, keep the original character
            result += romaji_text[i]
            i += 1
    
    return result


@dataclass
class FlashcardItem:
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


class BaseFlashcardEngine:
    """Base class for flashcard engines that can be extended for different modules"""
    
    def __init__(self, filename: str, module_name: str = "flashcard"):
        self.filename = filename
        self.module_name = module_name
        self._data = self.load_flashcards_from_csv(filename)
    
    def load_flashcards_from_csv(self, path: str) -> list[FlashcardItem]:
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
    
    def load_flashcards_from_json(self, path: str) -> list[FlashcardItem]:
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
                    furigana_text=furigana_text
                )
                flashcards.append(item)
        
        return flashcards
    
    def __getitem__(self, index: int) -> FlashcardItem:
        return self._data[index]
    
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
    
    def check_answers(self, user_inputs: dict, item: FlashcardItem, checking_styles: List[str]) -> dict:
        """Check multiple answers against different checking styles - can be overridden"""
        results = {}
        
        for style in checking_styles:
            user_input_raw = user_inputs.get(f"user_{style}", "").strip()
            
            if style == "hiragana":
                # For hiragana checking: JavaScript converts romaji to hiragana in real-time
                # So user_input_raw should already be hiragana characters
                correct_answer = item.hiragana
                is_correct = user_input_raw.lower() == correct_answer.lower() if user_input_raw else False
                
                results[style] = {
                    "user_input": user_input_raw,  # Show what user typed (should be hiragana)
                    "correct_answer": correct_answer,
                    "is_correct": is_correct
                }
            elif style == "romaji":
                # For romaji checking: compare romaji directly
                user_input = user_input_raw.lower()
                correct_answer = item.romaji.lower() if item.romaji else ""
                is_correct = user_input == correct_answer if user_input_raw else False
                
                results[style] = {
                    "user_input": user_input_raw,
                    "correct_answer": item.romaji if item.romaji else "",
                    "is_correct": is_correct
                }
            elif style == "kanji":
                user_input = user_input_raw.lower()
                correct_answer = item.kanji.lower()
                is_correct = user_input == correct_answer if user_input_raw else False
                
                results[style] = {
                    "user_input": user_input_raw,
                    "correct_answer": item.kanji,
                    "is_correct": is_correct
                }
            elif style == "katakana":
                # Skip if katakana is not available (marked with "–" or empty)
                if not item.katakana or item.katakana.strip() in ['–', '']:
                    continue
                    
                user_input = user_input_raw.lower()
                correct_answer = item.katakana.lower()
                is_correct = user_input == correct_answer if user_input_raw else False
                
                results[style] = {
                    "user_input": user_input_raw,
                    "correct_answer": item.katakana,
                    "is_correct": is_correct
                }
            elif style == "english":
                user_input = user_input_raw.lower().strip()
                correct_answers_text = item.english
                
                # Split by " / " to get multiple correct answers
                correct_answers = [answer.strip().lower() for answer in correct_answers_text.split(" / ")]
                
                # Check if user input matches any of the correct answers
                is_correct = user_input in correct_answers if user_input_raw else False
                
                results[style] = {
                    "user_input": user_input_raw,
                    "correct_answer": correct_answers_text,  # Show all possible answers
                    "is_correct": is_correct
                }
        
        return results


class FlashcardBlueprint:
    """Base class for creating flashcard blueprints"""
    
    def __init__(self, module_name: str, engine: BaseFlashcardEngine):
        self.module_name = module_name
        self.engine = engine
        self.blueprint = self._create_blueprint()
    
    def _create_blueprint(self):
        """Create the Flask blueprint - can be overridden by subclasses"""
        bp = Blueprint(self.module_name, __name__)
        
        @bp.route("/", methods=["GET"])
        @login_required
        def index():
            settings = self.get_user_settings()
            item = self.engine.get_next(settings["flashcard_styles"])
            return render_template("flashcard.html",  # Use generic template instead of f"{self.module_name}.html"
                                item=item, 
                                results=None, 
                                settings=settings,
                                module_name=self.module_name)
        
        @bp.route("/settings", methods=["POST"])
        @login_required
        def update_settings():
            """Update user settings"""
            # Get flashcard styles
            flashcard_styles = []
            for style in ["hiragana", "kanji", "katakana", "english"]:
                if request.form.get(f"flashcard_{style}"):
                    flashcard_styles.append(style)
            
            # Get checking styles
            checking_styles = []
            for style in ["hiragana", "kanji", "katakana", "english", "romaji"]:
                if request.form.get(f"checking_{style}"):
                    checking_styles.append(style)
            
            # Ensure at least one option is selected
            if not flashcard_styles:
                flashcard_styles = ["hiragana"]
            if not checking_styles:
                checking_styles = ["english"]
            
            # Get current settings to preserve furigana settings if they exist
            current_settings = self.get_user_settings()
            
            settings_update = {
                "flashcard_styles": flashcard_styles,
                "checking_styles": checking_styles
            }
            
            # Handle furigana settings for verb modules
            if hasattr(self.engine, 'get_default_settings'):
                default_settings = self.engine.get_default_settings()
                if "show_furigana" in default_settings:
                    settings_update["show_furigana"] = bool(request.form.get("show_furigana"))
                    settings_update["furigana_style"] = request.form.get("furigana_style", default_settings["furigana_style"])
            
            session["settings"] = settings_update
            
            return redirect(url_for(f"{self.module_name}.index"))
        
        @bp.route("/check", methods=["POST"])
        @login_required
        def check():
            item = self.engine[int(request.form["item_id"])]
            settings = self.get_user_settings()
            
            # Collect user inputs for all checking styles
            user_inputs = {}
            for style in settings["checking_styles"]:
                if style in ["hiragana", "romaji"]:
                    # Both hiragana and romaji use the same input field
                    user_inputs[f"user_{style}"] = request.form.get("user_hiragana_romaji", "")
                else:
                    user_inputs[f"user_{style}"] = request.form.get(f"user_{style}", "")
            
            results = self.engine.check_answers(user_inputs, item, settings["checking_styles"])
            
            # Check if all answers are correct
            all_correct = all(result["is_correct"] for result in results.values())
            
            return render_template("flashcard.html",  # Use generic template here too
                                item=item, 
                                results=results, 
                                all_correct=all_correct, 
                                settings=settings,
                                module_name=self.module_name)
        
        @bp.route("/api/correct-answers", methods=["GET"])
        @login_required
        def get_correct_answers():
            """API endpoint to get correct answers for the current item"""
            item_id = request.args.get('item_id')
            if not item_id:
                return {"error": "item_id parameter is required"}, 400
            
            try:
                item_id = int(item_id)
                item = self.engine[item_id]
                settings = self.get_user_settings()
                
                # Build correct answers based on checking styles
                correct_answers = {}
                for style in settings["checking_styles"]:
                    if style == "hiragana":
                        correct_answers["user_hiragana_romaji"] = item.hiragana
                    elif style == "romaji":
                        correct_answers["user_hiragana_romaji"] = item.romaji
                    elif style == "kanji":
                        correct_answers["user_kanji"] = item.kanji
                    elif style == "katakana":
                        # Only include if katakana is available (not "–" or empty)
                        if item.katakana and item.katakana.strip() not in ['–', '']:
                            correct_answers["user_katakana"] = item.katakana
                    elif style == "english":
                        # Return the full string for display, but we'll handle multiple answers in frontend
                        correct_answers["user_english"] = item.english
                
                return correct_answers
            
            except (ValueError, IndexError):
                return {"error": "Invalid item_id"}, 400
        
        return bp
    
    def get_user_settings(self):
        """Get user settings from session with defaults - can be overridden"""
        return session.get("settings", self.get_default_settings())
    
    def get_default_settings(self):
        """Get default settings for flashcards - can be overridden"""
        return {
            "flashcard_styles": ["hiragana"],
            "checking_styles": ["english"]
        }


class VerbFlashcardEngine(BaseFlashcardEngine):
    """Specialized engine for Japanese verbs with furigana support"""
    
    def __init__(self, json_filename: str, module_name: str = "verbs"):
        self.filename = json_filename
        self.module_name = module_name
        self._data = self.load_flashcards_from_json(json_filename)
    
    def get_default_settings(self):
        """Get default settings for verb flashcards with furigana options"""
        return {
            "flashcard_styles": ["hiragana"],
            "checking_styles": ["english"],
            "show_furigana": True,
            "furigana_style": "html"  # "html" or "text"
        }
    
    def get_user_settings(self):
        """Get user settings from session with furigana defaults"""
        default_settings = self.get_default_settings()
        user_settings = session.get("settings", default_settings)
        
        # Ensure furigana settings exist
        if "show_furigana" not in user_settings:
            user_settings["show_furigana"] = default_settings["show_furigana"]
        if "furigana_style" not in user_settings:
            user_settings["furigana_style"] = default_settings["furigana_style"]
        
        return user_settings


# Factory function to create flashcard modules
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


# Example usage:
# hiragana_bp = create_flashcard_module("hiragana", "./datum/hiragana.csv")
# katakana_bp = create_flashcard_module("katakana", "./datum/katakana.csv")
