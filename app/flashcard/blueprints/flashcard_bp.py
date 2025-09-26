"""Flashcard blueprint implementation."""

from flask import Blueprint, render_template, request, session, redirect, url_for

from app.auth import login_required, get_current_user
from app.settings import settings_registry, get_user_settings, update_user_settings, get_module_settings_config
from ..engines.base import BaseFlashcardEngine
from ..utils.validation import all_correct_logic


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
            settings = get_user_settings(self.module_name)
            settings_groups = settings_registry.get_settings_groups(get_module_settings_config(self.module_name))
            
            # Use new display mode system if available, otherwise fallback to old system
            if hasattr(self.engine, 'get_next_with_display_mode'):
                item = self.engine.get_next_with_display_mode(settings)
            else:
                # Fallback to old system for backward compatibility
                flashcard_styles = settings.get("flashcard_styles", ["hiragana"])
                item = self.engine.get_next(flashcard_styles)
            
            return render_template("flashcard/flashcard.html",  # Use new template with persistent settings
                                item=item, 
                                results=None, 
                                settings=settings,
                                settings_groups=settings_groups,
                                module_name=self.module_name)
        
        @bp.route("/settings", methods=["POST"])
        @login_required
        def update_settings():
            """Update user settings using the new centralized system"""
            try:
                # Convert form data to dict
                form_data = {}
                for key, value in request.form.items():
                    if value == "1":  # Checkbox checked
                        form_data[key] = True
                    elif value == "0":  # Checkbox unchecked
                        form_data[key] = False
                    else:
                        form_data[key] = value
                
                # Process settings through the centralized system
                update_user_settings(self.module_name, form_data)
                
                # Return JSON response instead of redirect
                return {"status": "success", "message": "Settings saved successfully", "settings": form_data}
            except Exception as e:
                return {"error": f"Error processing settings: {str(e)}"}, 500
        
        @bp.route("/api/test-settings", methods=["POST"])
        def test_update_settings():
            """Test endpoint for settings update (no auth required for testing)"""
            try:
                # Convert form data to dict
                form_data = {}
                for key, value in request.form.items():
                    if value == "1":  # Checkbox checked
                        form_data[key] = True
                    elif value == "0":  # Checkbox unchecked
                        form_data[key] = False
                    else:
                        form_data[key] = value
                
                # For test endpoint, just return success without actually saving
                return {"status": "success", "message": "Settings saved (test mode)", "settings": form_data}
            except Exception as e:
                return {"error": f"Error processing settings: {str(e)}"}, 500
        
        @bp.route("/check", methods=["POST"])
        @login_required
        def check():
            item = self.engine[int(request.form["item_id"])]
            settings = get_user_settings(self.module_name)
            settings_groups = settings_registry.get_settings_groups(get_module_settings_config(self.module_name))
            
            # Use new input modes system if available, otherwise fallback to old system
            if "input_modes" in settings and hasattr(self.engine, 'check_answers_with_input_modes'):
                # New system: collect user inputs for all input modes
                user_inputs = {}
                for mode in settings["input_modes"]:
                    # Try individual field first, then fallback to shared field for backward compatibility
                    individual_field = request.form.get(f"user_{mode}", "")
                    if not individual_field and mode in ["hiragana", "romaji"]:
                        # Fallback to shared field for backward compatibility
                        individual_field = request.form.get("user_hiragana_romaji", "")
                    
                    user_inputs[f"user_{mode}"] = individual_field
                
                results = self.engine.check_answers_with_input_modes(user_inputs, item, settings["input_modes"])
            else:
                # Fallback to old system for backward compatibility
                user_inputs = {}
                checking_styles = settings.get("checking_styles", ["english"])
                for style in checking_styles:
                    if style in ["hiragana", "romaji"]:
                        user_inputs[f"user_{style}"] = request.form.get("user_hiragana_romaji", "")
                    else:
                        user_inputs[f"user_{style}"] = request.form.get(f"user_{style}", "")
                
                results = self.engine.check_answers(user_inputs, item, checking_styles)
            
            # Check if all answers are correct (ignore skipped fields)
            all_correct = all_correct_logic(results)
            
            return render_template("flashcard/flashcard.html",  # Use new template
                                item=item, 
                                results=results, 
                                all_correct=all_correct, 
                                settings=settings,
                                settings_groups=settings_groups,
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
                settings = get_user_settings(self.module_name)
                
                # Build correct answers based on input modes
                correct_answers = {}
                input_modes = settings.get("input_modes", settings.get("checking_styles", ["english"]))
                
                for mode in input_modes:
                    if mode == "hiragana":
                        correct_answers["user_hiragana"] = item.hiragana
                        # Also provide shared field for backward compatibility
                        correct_answers["user_hiragana_romaji"] = item.hiragana
                    elif mode == "romaji":
                        correct_answers["user_romaji"] = item.romaji
                        # Also provide shared field for backward compatibility
                        correct_answers["user_hiragana_romaji"] = item.romaji
                    elif mode == "kanji":
                        correct_answers["user_kanji"] = item.kanji
                    elif mode == "katakana":
                        # Only include if katakana is available (not "–" or empty)
                        if item.katakana and item.katakana.strip() not in ['–', '']:
                            correct_answers["user_katakana"] = item.katakana
                    elif mode == "english":
                        correct_answers["user_english"] = item.english
                
                return correct_answers
            
            except (ValueError, IndexError):
                return {"error": "Invalid item_id"}, 400
        
        @bp.route("/api/display-text", methods=["GET"])
        @login_required
        def get_display_text():
            """API endpoint to get display text for an item based on current settings"""
            item_id = request.args.get('item_id')
            if not item_id:
                return {"error": "item_id parameter is required"}, 400
            
            try:
                item_id = int(item_id)
                item = self.engine[item_id]
                
                # Get settings from URL parameters (real-time) or fallback to session settings
                display_mode = request.args.get('display_mode')
                kana_type = request.args.get('kana_type')
                furigana_style = request.args.get('furigana_style')
                
                if display_mode and kana_type:
                    # Use real-time settings from frontend
                    settings = {
                        "display_mode": display_mode,
                        "kana_type": kana_type,
                        "furigana_style": furigana_style or "ruby",
                        "proportions": {
                            "kana": float(request.args.get('proportions.kana', 0.3)),
                            "kanji": float(request.args.get('proportions.kanji', 0.2)),
                            "kanji_furigana": float(request.args.get('proportions.kanji_furigana', 0.2)),
                            "english": float(request.args.get('proportions.english', 0.3))
                        }
                    }
                else:
                    # Fallback to session settings (existing behavior)
                    settings = get_user_settings(self.module_name)
                
                # Use the new display text logic
                if hasattr(self.engine, 'get_display_text'):
                    display_result = self.engine.get_display_text(item, settings)
                    return {
                        "text": display_result["text"],
                        "script": display_result["script"],
                        "mode": display_result["mode"],
                        "fallback_used": display_result["fallback_used"]
                    }
                else:
                    # Fallback for engines without display text method
                    return {
                        "text": item.prompt,
                        "script": item.prompt_script,
                        "mode": "legacy",
                        "fallback_used": False
                    }
            
            except (ValueError, IndexError):
                return {"error": "Invalid item_id"}, 400
        
        @bp.route("/api/test-display-text", methods=["GET"])
        def test_display_text():
            """Test endpoint for display text (no auth required for testing)"""
            item_id = request.args.get('item_id', '0')
            display_mode = request.args.get('display_mode', 'kana')
            kana_type = request.args.get('kana_type', 'hiragana')
            furigana_style = request.args.get('furigana_style', 'ruby')
            
            try:
                item_id = int(item_id)
                item = self.engine[item_id]
                
                # Create test settings
                test_settings = {
                    "display_mode": display_mode,
                    "kana_type": kana_type,
                    "furigana_style": furigana_style,
                    "proportions": {
                        "kana": 0.3,
                        "kanji": 0.2,
                        "kanji_furigana": 0.2,
                        "english": 0.3
                    }
                }
                
                # Use the new display text logic
                if hasattr(self.engine, 'get_display_text'):
                    display_result = self.engine.get_display_text(item, test_settings)
                    return {
                        "text": display_result["text"],
                        "script": display_result["script"],
                        "mode": display_result["mode"],
                        "fallback_used": display_result["fallback_used"],
                        "test_settings": test_settings,
                        "item_info": {
                            "english": item.english,
                            "hiragana": item.hiragana,
                            "kanji": item.kanji,
                            "katakana": item.katakana
                        }
                    }
                else:
                    return {"error": "Engine does not support display text method"}
            
            except (ValueError, IndexError) as e:
                return {"error": f"Invalid item_id: {e}"}, 400
        
        @bp.route("/api/test-correct-answers", methods=["GET"])
        def test_correct_answers():
            """Test endpoint for correct answers without authentication"""
            item_id = request.args.get('item_id', '0')
            input_modes = request.args.get('input_modes', 'hiragana,romaji,english').split(',')
            
            try:
                item_id = int(item_id)
                item = self.engine[item_id]
                
                # Build correct answers based on input modes
                correct_answers = {}
                for mode in input_modes:
                    mode = mode.strip()
                    if mode == "hiragana":
                        correct_answers["user_hiragana"] = item.hiragana
                        correct_answers["user_hiragana_romaji"] = item.hiragana
                    elif mode == "romaji":
                        correct_answers["user_romaji"] = item.romaji
                        correct_answers["user_hiragana_romaji"] = item.romaji
                    elif mode == "kanji":
                        correct_answers["user_kanji"] = item.kanji
                    elif mode == "katakana":
                        if item.katakana and item.katakana.strip() not in ['–', '']:
                            correct_answers["user_katakana"] = item.katakana
                    elif mode == "english":
                        correct_answers["user_english"] = item.english
                
                return {
                    "correct_answers": correct_answers,
                    "input_modes": input_modes,
                    "item_info": {
                        "hiragana": item.hiragana,
                        "kanji": item.kanji,
                        "katakana": item.katakana,
                        "english": item.english,
                        "romaji": item.romaji
                    }
                }
                
            except (ValueError, IndexError) as e:
                return {"error": f"Invalid item_id: {e}"}, 400
            except Exception as e:
                return {"error": f"Error processing request: {str(e)}"}, 500
        
        @bp.route("/api/test-check-answers", methods=["POST"])
        def test_check_answers():
            """Test endpoint for answer checking without authentication"""
            try:
                item_id = int(request.form.get('item_id', 0))
                item = self.engine[item_id]
                
                # Get test input modes
                input_modes = request.form.get('input_modes', 'hiragana,romaji,english').split(',')
                
                # Collect user inputs
                user_inputs = {}
                for mode in input_modes:
                    mode = mode.strip()
                    # Try individual field first, then fallback to shared field
                    individual_field = request.form.get(f"user_{mode}", "")
                    if not individual_field and mode in ["hiragana", "romaji"]:
                        individual_field = request.form.get("user_hiragana_romaji", "")
                    user_inputs[f"user_{mode}"] = individual_field
                
                # Use the new answer checking logic
                if hasattr(self.engine, 'check_answers_with_input_modes'):
                    results = self.engine.check_answers_with_input_modes(user_inputs, item, input_modes)
                else:
                    results = {"error": "Engine does not support new answer checking"}
                
                return {
                    "results": results,
                    "user_inputs": user_inputs,
                    "input_modes": input_modes,
                    "all_correct": all_correct_logic(results)
                }
                
            except (ValueError, IndexError) as e:
                return {"error": f"Invalid item_id: {e}"}, 400
            except Exception as e:
                return {"error": f"Error processing request: {str(e)}"}, 500
        
        return bp
