from flask_restx import Api, Resource, fields
from flask import Blueprint, request
import json
import os
from datetime import datetime
import uuid

# Create API blueprint
bp = Blueprint('v2_feedback_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Feedback API',
          version='2.0',
          description='''
# Benky-Fy V2 Feedback API

## Overview
Collect user feedback data for analytics, progress tracking, and spaced repetition algorithms.

## Endpoints
- **POST** `/v2/feedback/answer` - Record user answer feedback

## Data Collection
- User answers and correctness
- Attempt tracking and progress
- Settings context for learning patterns
- Timestamp for temporal analysis

## Use Cases
- Progress tracking and analytics
- Spaced repetition algorithm input
- Learning pattern analysis
- Performance optimization
          ''',
          doc='/v2/feedback/docs/',
          prefix='/v2')

# Define models for API documentation
settings_model = api.model('Settings', {
    'input_hiragana': fields.Boolean(description='Hiragana input enabled'),
    'input_katakana': fields.Boolean(description='Katakana input enabled'),
    'input_english': fields.Boolean(description='English input enabled'),
    'input_kanji': fields.Boolean(description='Kanji input enabled'),
    'input_romaji': fields.Boolean(description='Romaji input enabled'),
    'display_mode': fields.String(description='Display mode (kanji, hiragana, etc.)'),
    'furigana_style': fields.String(description='Furigana display style')
})

feedback_request_model = api.model('FeedbackRequest', {
    'moduleName': fields.String(required=True, description='Module name (verbs, adjectives, etc.)'),
    'itemId': fields.String(required=True, description='Word/item identifier'),
    'userAnswer': fields.String(required=True, description='User provided answer'),
    'isCorrect': fields.Boolean(required=True, description='Whether answer is correct'),
    'matchedType': fields.String(required=True, description='Type that matched (english, kanji, etc.)'),
    'attempts': fields.Integer(required=True, description='Number of attempts for this item'),
    'timestamp': fields.String(required=True, description='ISO timestamp of the interaction'),
    'settings': fields.Nested(settings_model, required=True, description='User settings context')
})

feedback_response_model = api.model('FeedbackResponse', {
    'success': fields.Boolean(description='Whether feedback was recorded successfully'),
    'message': fields.String(description='Response message')
})

def _validate_feedback_data(data: dict) -> tuple[bool, str]:
    """Validate feedback data structure and content."""
    required_fields = ['moduleName', 'itemId', 'userAnswer', 'isCorrect', 'matchedType', 'attempts', 'timestamp', 'settings']
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate data types
    if not isinstance(data['moduleName'], str) or not data['moduleName'].strip():
        return False, "moduleName must be a non-empty string"
    
    if not isinstance(data['itemId'], str) or not data['itemId'].strip():
        return False, "itemId must be a non-empty string"
    
    if not isinstance(data['userAnswer'], str):
        return False, "userAnswer must be a string"
    
    if not isinstance(data['isCorrect'], bool):
        return False, "isCorrect must be a boolean"
    
    if not isinstance(data['matchedType'], str) or not data['matchedType'].strip():
        return False, "matchedType must be a non-empty string"
    
    if not isinstance(data['attempts'], int) or data['attempts'] < 1:
        return False, "attempts must be a positive integer"
    
    if not isinstance(data['timestamp'], str) or not data['timestamp'].strip():
        return False, "timestamp must be a non-empty string"
    
    if not isinstance(data['settings'], dict):
        return False, "settings must be a dictionary"
    
    # Validate settings structure
    settings = data['settings']
    required_settings = ['input_hiragana', 'input_katakana', 'input_english', 'input_kanji', 'input_romaji', 'display_mode', 'furigana_style']
    
    for setting in required_settings:
        if setting not in settings:
            return False, f"Missing required setting: {setting}"
    
    # Validate boolean settings
    boolean_settings = ['input_hiragana', 'input_katakana', 'input_english', 'input_kanji', 'input_romaji']
    for setting in boolean_settings:
        if not isinstance(settings[setting], bool):
            return False, f"Setting {setting} must be a boolean"
    
    # Validate string settings
    string_settings = ['display_mode', 'furigana_style']
    for setting in string_settings:
        if not isinstance(settings[setting], str) or not settings[setting].strip():
            return False, f"Setting {setting} must be a non-empty string"
    
    return True, "Valid"

def _store_feedback_data(data: dict) -> bool:
    """Store feedback data for analytics and progress tracking."""
    try:
        # Create feedback directory if it doesn't exist
        feedback_dir = "./logs/feedback"
        os.makedirs(feedback_dir, exist_ok=True)
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"feedback_{timestamp}_{unique_id}.json"
        filepath = os.path.join(feedback_dir, filename)
        
        # Add processing metadata
        feedback_record = {
            "id": str(uuid.uuid4()),
            "processed_at": datetime.now().isoformat(),
            "data": data
        }
        
        # Write to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(feedback_record, f, indent=2, ensure_ascii=False)
        
        return True
        
    except Exception as e:
        print(f"Error storing feedback data: {e}")
        return False

@api.route('/feedback/answer')
class FeedbackResource(Resource):
    @api.doc('record_feedback', 
             description='Record user answer feedback for analytics',
             responses={
                 200: 'Success - Feedback recorded',
                 400: 'Invalid request data',
                 500: 'Server error'
             },
             examples={
                 'success': {
                     'summary': 'Successful feedback recording',
                     'description': 'Record user answer with correct data',
                     'value': {
                         'moduleName': 'verbs',
                         'itemId': 'a1e9e1b8-4846-5387-9b64-881e21bd7a0d',
                         'userAnswer': 'red',
                         'isCorrect': True,
                         'matchedType': 'english',
                         'attempts': 1,
                         'timestamp': '2024-01-15T10:30:00Z',
                         'settings': {
                             'input_hiragana': True,
                             'input_katakana': False,
                             'input_english': True,
                             'input_kanji': False,
                             'input_romaji': True,
                             'display_mode': 'kanji',
                             'furigana_style': 'inline'
                         }
                     }
                 }
             })
    @api.expect(feedback_request_model)
    @api.marshal_with(feedback_response_model)
    def post(self):
        """Record user answer feedback."""
        try:
            # Get request data
            data = request.get_json()
            
            if not data:
                api.abort(400, "Request body must contain JSON data")
            
            # Validate data
            is_valid, error_message = _validate_feedback_data(data)
            if not is_valid:
                api.abort(400, f"Invalid feedback data: {error_message}")
            
            # Store feedback data
            success = _store_feedback_data(data)
            
            if success:
                return {
                    "success": True,
                    "message": "Feedback recorded successfully"
                }
            else:
                api.abort(500, "Failed to store feedback data")
                
        except Exception as e:
            api.abort(500, f"Internal server error: {str(e)}")
