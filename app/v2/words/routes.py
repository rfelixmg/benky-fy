from flask_restx import Api, Resource, fields
from flask import Blueprint
import json
import os
import hashlib
import uuid

# Create API blueprint
bp = Blueprint('v2_words_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Words API',
          version='2.0',
          description='''
# Benky-Fy V2 Words API

## Overview
Pure JSON data delivery for Japanese learning words. No view logic - just clean data.

## Quick Start
1. **Get words**: `/v2/words/verbs` - Returns list of verbs with IDs
2. **Use IDs**: Copy word IDs from response to test conjugation endpoint

## Available Modules
- `verbs` - Japanese verbs
- `adjectives` - Japanese adjectives  
- `hiragana` - Hiragana characters
- `katakana` - Katakana characters
- `numbers_basic` - Basic numbers
- `numbers_extended` - Extended numbers
- `days_of_week` - Days of the week
- `months_complete` - Months
- `colors_basic` - Basic colors
- `greetings_essential` - Essential greetings
- `question_words` - Question words
- `base_nouns` - Base nouns
- `katakana_words` - Katakana words

## Example Workflow
1. GET `/v2/words/verbs` → Get verb list with IDs
2. Copy a word ID from response
3. GET `/v2/conjugation/{word_id}` → Get conjugation forms

## Response Format
All responses are pure JSON with deterministic IDs for consistency.
          ''',
          doc='/v2/docs/',
          prefix='/v2')

# Define models for API documentation
word_model = api.model('Word', {
    'id': fields.String(required=True, description='Unique word identifier'),
    'kanji': fields.String(description='Japanese kanji characters'),
    'hiragana': fields.String(description='Japanese hiragana characters'),
    'english': fields.String(description='English translation'),
    'type': fields.String(description='Word type (verb, adjective, noun, etc.)')
})

words_response_model = api.model('WordsResponse', {
    'words': fields.List(fields.Nested(word_model), description='List of words')
})

def _load_module_data(module_name: str) -> list:
    """Load word data from JSON file."""
    file_path = f"./datum/{module_name}.json"
    if not os.path.exists(file_path):
        return []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def _generate_deterministic_id(word: dict) -> str:
    """Generate a deterministic ID for a word."""
    word_content = f"{word.get('kanji', '')}{word.get('hiragana', '')}{word.get('english', '')}"
    word_hash = hashlib.md5(word_content.encode()).hexdigest()
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, word_hash))

@api.route('/words/<string:module>')
class WordsResource(Resource):
    @api.doc('get_words', 
             description='Get list of words for a specific module',
             params={'module': 'Module name (verbs, adjectives, hiragana, etc.)'},
             responses={
                 200: 'Success - Returns list of words',
                 404: 'Module not found'
             },
             examples={
                 'verbs': {
                     'summary': 'Get verbs',
                     'description': 'Returns all verbs with deterministic IDs',
                     'value': {
                         'words': [
                             {
                                 'id': 'a1e9e1b8-4846-5387-9b64-881e21bd7a0d',
                                 'kanji': '見る',
                                 'hiragana': 'みる',
                                 'english': 'to see',
                                 'type': 'verb'
                             }
                         ]
                     }
                 },
                 'adjectives': {
                     'summary': 'Get adjectives',
                     'description': 'Returns all adjectives',
                     'value': {
                         'words': [
                             {
                                 'id': '24d3c3c6-a023-5d86-aa11-955d46acd2d1',
                                 'kanji': '大きい',
                                 'hiragana': 'おおきい',
                                 'english': 'big',
                                 'type': 'adjective'
                             }
                         ]
                     }
                 }
             })
    @api.marshal_with(words_response_model)
    def get(self, module):
        """Return list of words for a module."""
        words = _load_module_data(module)
        
        # Transform data to V2 format
        formatted_words = [{
            "id": _generate_deterministic_id(word),
            "kanji": word.get("kanji", ""),
            "hiragana": word.get("hiragana", ""),
            "english": word.get("english", ""),
            "type": word.get("type", "noun")
        } for word in words]
        
        return {"words": formatted_words}