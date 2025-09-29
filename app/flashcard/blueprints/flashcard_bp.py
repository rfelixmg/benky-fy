"""Flashcard blueprint implementation."""

from flask import Blueprint, render_template, request, session, redirect, url_for

from app.auth import login_required, get_current_user
from app.settings import settings_registry, get_user_settings, update_user_settings, get_module_settings_config
from app.settings.config.module_configs import get_module_config
from flask import jsonify
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
            # Use module name directly for new module-aware system
            settings_groups = settings_registry.get_module_settings_groups(self.module_name)
            
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
        
        
        @bp.route("/check", methods=["POST"])
        @login_required
        def check():
            item = self.engine[int(request.form["item_id"]) - 1]  # Convert from 1-based to 0-based indexing
            settings = get_user_settings(self.module_name)
            settings_groups = settings_registry.get_module_settings_groups(self.module_name)
            
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
                item = self.engine[item_id - 1]  # Convert from 1-based to 0-based indexing
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
                item = self.engine[item_id - 1]  # Convert from 1-based to 0-based indexing
                
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
        
        
        
        @bp.route("/api/dataset-info", methods=["GET"])
        def get_dataset_info():
            """Get dataset information including size"""
            try:
                return {
                    "total_items": len(self.engine._data),
                    "module_name": self.module_name,
                    "message": "Dataset info retrieved successfully"
                }
            except Exception as e:
                return {"error": f"Failed to get dataset info: {str(e)}"}, 500
        
        @bp.route("/api/settings/<module_name>", methods=["GET"])
        @login_required
        def get_module_settings_config(module_name):
            """Get module-specific settings configuration"""
            try:
                config = get_module_config(module_name)
                return jsonify({
                    'defaults': config.default_settings,
                    'available_options': config.available_options,
                    'restricted_options': config.restricted_options
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        @bp.route("/api/settings/validate", methods=["POST"])
        @login_required
        def validate_settings_for_module():
            """Validate settings against module configuration"""
            try:
                data = request.get_json()
                module_name = data.get('module_name')
                settings = data.get('settings', {})
                
                if not module_name:
                    return jsonify({'error': 'module_name is required'}), 400
                
                config = get_module_config(module_name)
                
                # Validate each setting
                validation_results = {}
                for key, value in settings.items():
                    is_valid = True
                    error_message = None
                    
                    # Check restricted options
                    restricted_values = config.restricted_options.get(key, [])
                    if value in restricted_values:
                        is_valid = False
                        error_message = f"Setting '{key}' value '{value}' is not allowed for module '{module_name}'"
                    
                    # Check available options
                    available_values = config.available_options.get(key, [])
                    if available_values and value not in available_values:
                        is_valid = False
                        if not error_message:
                            error_message = f"Setting '{key}' value '{value}' is not available for module '{module_name}'"
                    
                    validation_results[key] = {
                        'valid': is_valid,
                        'error': error_message,
                        'suggested_default': config.default_settings.get(key) if not is_valid else None
                    }
                
                return jsonify({
                    'module_name': module_name,
                    'validation_results': validation_results,
                    'all_valid': all(result['valid'] for result in validation_results.values())
                })
                
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        @bp.route("/api/check-answers", methods=["POST"])
        @login_required
        def api_check_answers():
            """API endpoint for checking answers (JSON response)"""
            try:
                item_id = int(request.form.get('item_id', 0))
                item = self.engine[item_id - 1]  # Convert from 1-based to 0-based indexing
                settings = get_user_settings(self.module_name)
                
                # Get input modes
                input_modes = request.form.get('input_modes', '').split(',')
                if not input_modes or input_modes == ['']:
                    input_modes = settings.get("input_modes", settings.get("checking_styles", ["english"]))
                
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
                    # Fallback to old system
                    checking_styles = settings.get("checking_styles", ["english"])
                    results = self.engine.check_answers(user_inputs, item, checking_styles)
                
                # Check if all answers are correct
                all_correct = all_correct_logic(results)
                
                return {
                    "results": results,
                    "user_inputs": user_inputs,
                    "input_modes": input_modes,
                    "all_correct": all_correct
                }
                
            except (ValueError, IndexError) as e:
                return {"error": f"Invalid item_id: {e}"}, 400
            except Exception as e:
                return {"error": f"Error processing request: {str(e)}"}, 500
        
        
        return bp
