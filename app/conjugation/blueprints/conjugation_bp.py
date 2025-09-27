"""Conjugation API blueprint implementation."""

from flask import Blueprint, request, jsonify
from app.auth import login_required
from app.conjugation import create_conjugation_checker
from app.flashcard.engines.verb import VerbFlashcardEngine
from app.flashcard.engines.adjective import AdjectiveFlashcardEngine
import json
import os


def create_conjugation_blueprint():
    """Create conjugation API blueprint"""
    bp = Blueprint('conjugation', __name__)
    
    # Load data files
    verbs_file = os.path.join(os.path.dirname(__file__), '../../../datum/verbs.json')
    adjectives_file = os.path.join(os.path.dirname(__file__), '../../../datum/adjectives.json')
    
    verb_engine = VerbFlashcardEngine(verbs_file)
    adjective_engine = AdjectiveFlashcardEngine(adjectives_file)
    
    @bp.route('/api/conjugation/check', methods=['POST'])
    @login_required
    def check_conjugation():
        """Check conjugation answer"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            user_input = data.get('user_input', '').strip()
            item_id = data.get('item_id')
            conjugation_form = data.get('conjugation_form', '')
            module_name = data.get('module_name', 'verbs')
            
            if not user_input or not item_id or not conjugation_form:
                return jsonify({'error': 'Missing required fields: user_input, item_id, conjugation_form'}), 400
            
            # Get the item data
            if module_name == 'verbs':
                if item_id < 1 or item_id > len(verb_engine._data):
                    return jsonify({'error': 'Invalid item_id'}), 400
                item = verb_engine._data[item_id - 1]
            elif module_name == 'adjectives':
                if item_id < 1 or item_id > len(adjective_engine._data):
                    return jsonify({'error': 'Invalid item_id'}), 400
                item = adjective_engine._data[item_id - 1]
            else:
                return jsonify({'error': 'Invalid module_name'}), 400
            
            # Create conjugation checker
            checker = create_conjugation_checker()
            
            # Determine grammatical type
            if module_name == 'verbs':
                # Convert FlashcardItem to dict for conjugation checker
                item_dict = {
                    'kanji': item.kanji,
                    'hiragana': item.hiragana,
                    'english': item.english,
                    'conjugations': getattr(item, 'conjugations', {}),
                    'conjugation': getattr(item, 'conjugation', 'godan'),
                    'grammatical_type': getattr(item, 'grammatical_type', 'verb')
                }
                grammatical_type = item_dict.get('conjugation', '') or item_dict.get('grammatical_type', 'verb')
            else:
                # Convert FlashcardItem to dict for conjugation checker
                item_dict = {
                    'kanji': item.kanji,
                    'hiragana': item.hiragana,
                    'english': item.english,
                    'conjugations': getattr(item, 'conjugations', {}),
                    'conjugation_type': getattr(item, 'conjugation_type', 'i_adjective')
                }
                grammatical_type = item_dict.get('conjugation_type', 'i_adjective')
            
            # Check the conjugation
            result = checker.check_answer(user_input, item_dict, conjugation_form, grammatical_type)
            
            return jsonify({
                'success': True,
                'is_correct': result.is_correct,
                'user_input': result.user_input,
                'correct_answer': result.correct_answer,
                'conjugation_form': result.conjugation_form,
                'feedback': result.feedback,
                'item_info': {
                    'kanji': item.kanji,
                    'hiragana': item.hiragana,
                    'english': item.english,
                    'conjugation_type': grammatical_type
                }
            })
            
        except Exception as e:
            return jsonify({'error': f'Failed to check conjugation: {str(e)}'}), 500
    
    @bp.route('/api/conjugation/forms/<module_name>', methods=['GET'])
    @login_required
    def get_conjugation_forms(module_name):
        """Get available conjugation forms for a module"""
        try:
            if module_name == 'verbs':
                checker = create_conjugation_checker()
                forms = checker.verb_checker.get_supported_forms()
            elif module_name == 'adjectives':
                checker = create_conjugation_checker()
                forms = checker.adjective_checker.get_supported_forms()
            else:
                return jsonify({'error': 'Invalid module_name'}), 400
            
            return jsonify({
                'success': True,
                'module_name': module_name,
                'forms': forms
            })
            
        except Exception as e:
            return jsonify({'error': f'Failed to get conjugation forms: {str(e)}'}), 500
    
    @bp.route('/api/conjugation/practice/<module_name>', methods=['GET'])
    @login_required
    def get_conjugation_practice(module_name):
        """Get a conjugation practice item"""
        try:
            conjugation_form = request.args.get('form', 'polite')
            
            if module_name == 'verbs':
                if not verb_engine._data:
                    return jsonify({'error': 'No verb data available'}), 500
                
                import random
                item = random.choice(verb_engine._data)
                grammatical_type = item.get('conjugation', '') or item.get('grammatical_type', 'verb')
            elif module_name == 'adjectives':
                if not adjective_engine._data:
                    return jsonify({'error': 'No adjective data available'}), 500
                
                import random
                item = random.choice(adjective_engine._data)
                grammatical_type = item.get('conjugation_type', 'i_adjective')
            else:
                return jsonify({'error': 'Invalid module_name'}), 400
            
            # Get the correct answer for the requested form
            conjugations = item.get('conjugations', {})
            correct_answer = conjugations.get(conjugation_form, {})
            
            if not correct_answer:
                return jsonify({'error': f'Conjugation form "{conjugation_form}" not available for this item'}), 400
            
            return jsonify({
                'success': True,
                'item': {
                    'id': item.get('id', 0),
                    'kanji': item.get('kanji', ''),
                    'hiragana': item.get('hiragana', ''),
                    'english': item.get('english', ''),
                    'conjugation_type': grammatical_type
                },
                'conjugation_form': conjugation_form,
                'prompt': f"Conjugate '{item.get('english', '')}' in {conjugation_form} form"
            })
            
        except Exception as e:
            return jsonify({'error': f'Failed to get conjugation practice: {str(e)}'}), 500
    
    @bp.route('/api/conjugation/stats/<module_name>', methods=['GET'])
    @login_required
    def get_conjugation_stats(module_name):
        """Get conjugation statistics for a module"""
        try:
            if module_name == 'verbs':
                data = verb_engine._data
                total_items = len(data)
                
                # Count items by conjugation type
                type_counts = {}
                for item in data:
                    conj_type = item.get('conjugation', '') or item.get('grammatical_type', 'unknown')
                    type_counts[conj_type] = type_counts.get(conj_type, 0) + 1
                
            elif module_name == 'adjectives':
                data = adjective_engine._data
                total_items = len(data)
                
                # Count items by conjugation type
                type_counts = {}
                for item in data:
                    conj_type = item.get('conjugation_type', 'unknown')
                    type_counts[conj_type] = type_counts.get(conj_type, 0) + 1
                
            else:
                return jsonify({'error': 'Invalid module_name'}), 400
            
            return jsonify({
                'success': True,
                'module_name': module_name,
                'total_items': total_items,
                'type_counts': type_counts
            })
            
        except Exception as e:
            return jsonify({'error': f'Failed to get conjugation stats: {str(e)}'}), 500
    
    return bp
