from flask_restx import Api, Resource, fields
from flask import Blueprint, request, session
import json
from typing import Dict, Any

# Create API blueprint
bp = Blueprint('v2_settings_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Settings API',
          version='2.0',
          description='''
# Benky-Fy V2 Settings API

## Overview
Session-based settings management for flashcard modules. Maintains V1 compatibility with clean JSON responses.

## How to Use
1. **Get settings**: GET `/v2/settings/{moduleName}` - Returns current settings
2. **Update settings**: POST `/v2/settings/{moduleName}` - Update settings with JSON body

## Settings Structure
- **Core**: flashcard_type, display_mode, input_modes
- **Furigana**: furigana_enabled, furigana_size
- **Conjugation**: conjugation_forms, practice_mode
- **Vocabulary**: priority_filter, learning_order

## Example Workflow
1. GET `/v2/settings/verbs` → Get current settings
2. POST `/v2/settings/verbs` with updated settings → Save changes
3. Settings persist in session across requests

## Response Format
Pure JSON with settings object. Session-based storage matching V1 behavior.
          ''',
          doc='/v2/settings/docs/',
          prefix='/v2')

# Define models for API documentation
settings_model = api.model('Settings', {
    'flashcard_type': fields.String(description='Type of flashcard practice'),
    'display_mode': fields.String(description='How flashcards are displayed'),
    'kana_type': fields.String(description='Kana script type'),
    'input_modes': fields.List(fields.String, description='Accepted input types'),
    'furigana_enabled': fields.Boolean(description='Show furigana'),
    'furigana_size': fields.String(description='Furigana size'),
    'conjugation_forms': fields.List(fields.String, description='Conjugation forms'),
    'practice_mode': fields.String(description='Conjugation practice mode'),
    'priority_filter': fields.String(description='Priority filter'),
    'learning_order': fields.Boolean(description='Follow learning order'),
    'proportions': fields.Raw(description='Display proportions for weighted mode'),
    'romaji_enabled': fields.Boolean(description='Enable romaji input'),
    'romaji_output_type': fields.String(description='Romaji conversion output'),
    'max_answer_attempts': fields.Integer(description='Maximum answer attempts')
})

settings_response_model = api.model('SettingsResponse', {
    'settings': fields.Nested(settings_model, description='Current settings')
})

error_model = api.model('Error', {
    'error': fields.String(description='Error message')
})

def _get_default_settings() -> Dict[str, Any]:
    """Get default settings matching V1 structure."""
    return {
        "flashcard_type": "translation",
        "display_mode": "kana",
        "kana_type": "hiragana",
        "input_modes": ["english"],
        "furigana_enabled": False,
        "furigana_size": "small",
        "conjugation_forms": ["polite", "negative", "past", "past_negative"],
        "practice_mode": "generation",
        "priority_filter": "all",
        "learning_order": True,
        "proportions": {
            "kana": 0.3,
            "kanji": 0.2,
            "kanji_furigana": 0.2,
            "english": 0.3
        },
        "romaji_enabled": False,
        "romaji_output_type": "hiragana",
        "max_answer_attempts": 3
    }

def _process_settings_update(form_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process settings update matching V1 logic."""
    processed = _get_default_settings()
    
    # Update with provided data
    for key, value in form_data.items():
        if key in processed:
            processed[key] = value
    
    # Process input modes
    input_modes = []
    for key, value in form_data.items():
        if key.startswith("input_") and value:
            input_modes.append(key.replace("input_", ""))
    
    if input_modes:
        processed["input_modes"] = input_modes
    
    # Process proportions for weighted mode
    if processed.get("display_mode") == "weighted":
        proportions = {
            "kana": float(form_data.get("proportion_kana", 0.3)),
            "kanji": float(form_data.get("proportion_kanji", 0.2)),
            "kanji_furigana": float(form_data.get("proportion_kanji_furigana", 0.2)),
            "english": float(form_data.get("proportion_english", 0.3))
        }
        
        # Normalize proportions
        total = sum(proportions.values())
        if total > 0:
            for key in proportions:
                proportions[key] = proportions[key] / total
        
        processed["proportions"] = proportions
    
    return processed

@api.route('/settings/<string:module_name>')
class SettingsResource(Resource):
    @api.doc('get_settings', 
             description='Get current settings for a module',
             params={'module_name': 'Module name (verbs, adjectives, etc.)'},
             responses={
                 200: 'Success - Returns current settings',
                 404: 'Module not found'
             },
             examples={
                 'verbs': {
                     'summary': 'Get verb settings',
                     'description': 'Returns current settings for verb module',
                     'value': {
                         'settings': {
                             'flashcard_type': 'translation',
                             'display_mode': 'kana',
                             'input_modes': ['english', 'hiragana'],
                             'max_answer_attempts': 3
                         }
                     }
                 }
             })
    @api.marshal_with(settings_response_model)
    def get(self, module_name):
        """Get current settings for a module."""
        session_key = f"flashcard_settings_{module_name}"
        settings = session.get(session_key, {})
        
        # If no settings found, return defaults
        if not settings:
            settings = _get_default_settings()
            session[session_key] = settings
        
        return {"settings": settings}
    
    @api.doc('update_settings', 
             description='Update settings for a module',
             params={'module_name': 'Module name (verbs, adjectives, etc.)'},
             responses={
                 200: 'Success - Settings updated',
                 400: 'Invalid settings data',
                 404: 'Module not found'
             },
             examples={
                 'update_verbs': {
                     'summary': 'Update verb settings',
                     'description': 'Update settings for verb module',
                     'value': {
                         'flashcard_type': 'conjugation',
                         'display_mode': 'kanji_furigana',
                         'input_modes': ['hiragana', 'katakana'],
                         'max_answer_attempts': 5
                     }
                 }
             })
    @api.marshal_with(settings_response_model)
    def post(self, module_name):
        """Update settings for a module."""
        try:
            # Get JSON data from request
            form_data = request.get_json() or {}
            
            # Process settings update
            processed_settings = _process_settings_update(form_data)
            
            # Store in session
            session_key = f"flashcard_settings_{module_name}"
            session[session_key] = processed_settings
            
            return {"settings": processed_settings}
            
        except Exception as e:
            api.abort(400, f"Invalid settings data: {str(e)}")
