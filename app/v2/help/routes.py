from flask_restx import Api, Resource, fields
from flask import Blueprint, request
import json
import os

# Create API blueprint
bp = Blueprint('v2_help_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Help API',
          version='2.0',
          description='''
# Benky-Fy V2 Help API

## Overview
Word information and help functionality for V2 API compatibility.

## How to Use
1. **Get word info**: GET `/v2/help/word-info?word={word}` - Returns word information
2. **Search across modules**: Searches all available word modules for matches

## Response Format
Pure JSON with word information including kanji, hiragana, english, and usage details.
          ''',
          doc='/v2/help/docs/',
          prefix='/v2')

# Define models for API documentation
word_info_model = api.model('WordInfo', {
    'word': fields.String(description='Searched word'),
    'found': fields.Boolean(description='Whether word was found'),
    'data': fields.Raw(description='Word data if found'),
    'module': fields.String(description='Module where word was found')
})

def _search_word_in_modules(word: str) -> dict:
    """Search for word across all modules."""
    modules = ['verbs', 'adjectives', 'hiragana', 'katakana', 'numbers_basic', 
               'numbers_extended', 'days_of_week', 'months_complete', 
               'colors_basic', 'greetings_essential', 'question_words', 
               'base_nouns', 'katakana_words']
    
    for module in modules:
        file_path = f"./datum/{module}.json"
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                words = json.load(f)
                for word_data in words:
                    # Check if word matches kanji, hiragana, or english
                    if (word_data.get('kanji', '').lower() == word.lower() or
                        word_data.get('hiragana', '').lower() == word.lower() or
                        word_data.get('english', '').lower() == word.lower()):
                        return {
                            'word': word,
                            'found': True,
                            'data': word_data,
                            'module': module
                        }
    
    return {
        'word': word,
        'found': False,
        'data': None,
        'module': None
    }

@api.route('/help/word-info')
class HelpResource(Resource):
    @api.doc('word_info', 
             description='Get word information',
             params={'word': 'Word to search for'},
             responses={
                 200: 'Success - Returns word information'
             })
    @api.marshal_with(word_info_model)
    def get(self):
        """Get word information."""
        word = request.args.get('word', '').strip()
        if not word:
            return {
                'word': '',
                'found': False,
                'data': None,
                'module': None
            }
        
        return _search_word_in_modules(word)
