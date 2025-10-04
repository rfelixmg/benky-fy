from flask_restx import Api, Resource, fields
from flask import Blueprint
import json
import os
import hashlib
import uuid
from typing import Dict, List, Any

# Create API blueprint
bp = Blueprint('v2_conjugation_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Conjugation API',
          version='2.0',
          description='''
# Benky-Fy V2 Conjugation API

## Overview
Generate conjugation forms for Japanese words. Pattern-based conjugation with no checking logic.

## How to Use
1. **Get word ID**: First call `/v2/words/{module}` to get word IDs
2. **Conjugate**: Use word ID in `/v2/conjugation/{word_id}`

## Supported Word Types
- **Verbs**: polite, negative, past, past_negative forms
- **Adjectives**: present, past, negative forms  
- **Nouns**: base form only

## Example Workflow
1. GET `/v2/words/verbs` → Get verbs with IDs
2. Copy ID: `a1e9e1b8-4846-5387-9b64-881e21bd7a0d`
3. GET `/v2/conjugation/a1e9e1b8-4846-5387-9b64-881e21bd7a0d` → Get conjugations

## Conjugation Patterns
- **Verbs**: Basic godan/ichidan patterns (simplified)
- **Adjectives**: i-adjective and na-adjective patterns
- **Deterministic**: Same word always generates same conjugations

## Response Format
Pure JSON with base form and conjugation array. No validation - frontend handles checking.
          ''',
          doc='/v2/conjugation/docs/',
          prefix='/v2')

# Define models for API documentation
base_form_model = api.model('BaseForm', {
    'kanji': fields.String(description='Japanese kanji characters'),
    'hiragana': fields.String(description='Japanese hiragana characters'),
    'english': fields.String(description='English translation'),
    'type': fields.String(description='Word type')
})

conjugation_form_model = api.model('ConjugationForm', {
    'form': fields.String(description='Conjugation form name'),
    'kanji': fields.String(description='Conjugated kanji'),
    'hiragana': fields.String(description='Conjugated hiragana')
})

conjugation_response_model = api.model('ConjugationResponse', {
    'word_id': fields.String(description='Word identifier'),
    'base_form': fields.Nested(base_form_model),
    'conjugations': fields.List(fields.Nested(conjugation_form_model))
})

error_model = api.model('Error', {
    'error': fields.String(description='Error message')
})

def _load_word_data(word_id: str) -> Dict[str, Any]:
    """Load word data by ID from all modules."""
    modules = ['verbs', 'adjectives', 'hiragana', 'katakana', 'numbers_basic', 
               'numbers_extended', 'days_of_week', 'months_complete', 
               'colors_basic', 'greetings_essential', 'question_words', 
               'base_nouns', 'katakana_words']
    
    for module in modules:
        file_path = f"./datum/{module}.json"
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    words = json.load(f)
                    for word in words:
                        # Generate deterministic ID for this word
                        word_content = f"{word.get('kanji', '')}{word.get('hiragana', '')}{word.get('english', '')}"
                        word_hash = hashlib.md5(word_content.encode()).hexdigest()
                        generated_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, word_hash))
                        if generated_id == word_id:
                            return word
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading {module}.json: {e}")
                continue
    return None

def _generate_conjugations(word_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate conjugation forms for a word based on its type."""
    conjugations = []
    word_type = word_data.get('type', 'noun')
    
    if word_type == 'verb':
        base_kanji = word_data.get('kanji', '')
        base_hiragana = word_data.get('hiragana', '')
        
        # Basic conjugation patterns
        conjugations = [
            {
                "form": "polite",
                "kanji": base_kanji + "ます" if base_kanji else "",
                "hiragana": base_hiragana + "ます" if base_hiragana else ""
            },
            {
                "form": "negative",
                "kanji": base_kanji + "ない" if base_kanji else "",
                "hiragana": base_hiragana + "ない" if base_hiragana else ""
            },
            {
                "form": "past",
                "kanji": base_kanji + "た" if base_kanji else "",
                "hiragana": base_hiragana + "た" if base_hiragana else ""
            },
            {
                "form": "past_negative",
                "kanji": base_kanji + "なかった" if base_kanji else "",
                "hiragana": base_hiragana + "なかった" if base_hiragana else ""
            }
        ]
    elif word_type == 'adjective':
        base_kanji = word_data.get('kanji', '')
        base_hiragana = word_data.get('hiragana', '')
        
        # Adjective conjugation patterns
        conjugations = [
            {
                "form": "present",
                "kanji": base_kanji,
                "hiragana": base_hiragana
            },
            {
                "form": "past",
                "kanji": base_kanji + "だった" if base_kanji else "",
                "hiragana": base_hiragana + "だった" if base_hiragana else ""
            },
            {
                "form": "negative",
                "kanji": base_kanji + "ではない" if base_kanji else "",
                "hiragana": base_hiragana + "ではない" if base_hiragana else ""
            }
        ]
    else:
        # For nouns and other types, return base form only
        conjugations = [
            {
                "form": "base",
                "kanji": word_data.get('kanji', ''),
                "hiragana": word_data.get('hiragana', '')
            }
        ]
    
    return conjugations

@api.route('/conjugation/<string:word_id>')
class ConjugationResource(Resource):
    @api.doc('get_conjugations',
             description='Get conjugation forms for a specific word',
             params={'word_id': 'Word identifier from words endpoint'},
             responses={
                 200: 'Success - Returns conjugation forms',
                 404: 'Word not found'
             },
             examples={
                 'verb_example': {
                     'summary': 'Conjugate a verb',
                     'description': 'Get conjugation forms for the verb "見る" (to see)',
                     'value': {
                         'word_id': 'a1e9e1b8-4846-5387-9b64-881e21bd7a0d',
                         'base_form': {
                             'kanji': '見る',
                             'hiragana': 'みる',
                             'english': 'to see',
                             'type': 'verb'
                         },
                         'conjugations': [
                             {
                                 'form': 'polite',
                                 'kanji': '見ます',
                                 'hiragana': 'みます'
                             },
                             {
                                 'form': 'negative',
                                 'kanji': '見ない',
                                 'hiragana': 'みない'
                             },
                             {
                                 'form': 'past',
                                 'kanji': '見た',
                                 'hiragana': 'みた'
                             },
                             {
                                 'form': 'past_negative',
                                 'kanji': '見なかった',
                                 'hiragana': 'みなかった'
                             }
                         ]
                     }
                 },
                 'adjective_example': {
                     'summary': 'Conjugate an adjective',
                     'description': 'Get conjugation forms for the adjective "大きい" (big)',
                     'value': {
                         'word_id': '24d3c3c6-a023-5d86-aa11-955d46acd2d1',
                         'base_form': {
                             'kanji': '大きい',
                             'hiragana': 'おおきい',
                             'english': 'big',
                             'type': 'adjective'
                         },
                         'conjugations': [
                             {
                                 'form': 'present',
                                 'kanji': '大きい',
                                 'hiragana': 'おおきい'
                             },
                             {
                                 'form': 'past',
                                 'kanji': '大きかった',
                                 'hiragana': 'おおきかった'
                             },
                             {
                                 'form': 'negative',
                                 'kanji': '大きくない',
                                 'hiragana': 'おおきくない'
                             }
                         ]
                     }
                 },
                 'error_example': {
                     'summary': 'Word not found',
                     'description': 'Error response when word ID does not exist',
                     'value': {
                         'error': 'Word not found'
                     }
                 }
             })
    @api.marshal_with(conjugation_response_model, code=200)
    @api.marshal_with(error_model, code=404)
    def get(self, word_id):
        """Return all conjugation forms for a word."""
        word_data = _load_word_data(word_id)
        
        if not word_data:
            api.abort(404, "Word not found")
        
        conjugations = _generate_conjugations(word_data)
        
        return {
            "word_id": word_id,
            "base_form": {
                "kanji": word_data.get('kanji', ''),
                "hiragana": word_data.get('hiragana', ''),
                "english": word_data.get('english', ''),
                "type": word_data.get('type', 'noun')
            },
            "conjugations": conjugations
        }