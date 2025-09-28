"""Custom Practice blueprint implementation."""

from flask import Blueprint, render_template, request, session, redirect, url_for, jsonify
from typing import Dict, Any, List

from app.auth import login_required, get_current_user
from app.settings import settings_registry, get_user_settings, update_user_settings, get_module_settings_config
from ..engines.custom_practice import CustomPracticeEngine
from ..utils.validation import all_correct_logic


class CustomPracticeBlueprint:
    """Blueprint for custom practice functionality"""
    
    def __init__(self):
        self.blueprint = self._create_blueprint()
    
    def _create_blueprint(self):
        """Create the Flask blueprint"""
        bp = Blueprint("custom_practice", __name__)
        
        @bp.route("/", methods=["GET"])
        @login_required
        def index():
            """Module selection page"""
            user = get_current_user()
            engine = CustomPracticeEngine([], 1)  # Empty engine for module list
            available_modules = engine.get_available_modules()
            
            return render_template("custom_practice/module_selection.html", 
                                 user=user,
                                 available_modules=available_modules)
        
        @bp.route("/session", methods=["POST"])
        @login_required
        def create_session():
            """Create a new custom practice session"""
            data = request.get_json()
            selected_modules = data.get('selected_modules', [])
            multi_word_count = data.get('multi_word_count', 1)
            
            if not selected_modules:
                return jsonify({'error': 'No modules selected'}), 400
            
            # Create engine with selected modules
            engine = CustomPracticeEngine(selected_modules, multi_word_count)
            
            # Store session data
            session['custom_practice_modules'] = selected_modules
            session['custom_practice_multi_word_count'] = multi_word_count
            session['custom_practice_engine_data'] = {
                'selected_modules': selected_modules,
                'multi_word_count': multi_word_count,
                'words_practiced': []
            }
            
            return jsonify({
                'success': True,
                'session_id': 'custom_session',
                'total_words': len(engine._data),
                'selected_modules': selected_modules
            })
        
        @bp.route("/practice", methods=["GET"])
        @login_required
        def practice():
            """Practice session page"""
            if 'custom_practice_modules' not in session:
                return redirect(url_for('custom_practice.index'))
            
            selected_modules = session['custom_practice_modules']
            multi_word_count = session.get('custom_practice_multi_word_count', 1)
            
            # Create engine
            engine = CustomPracticeEngine(selected_modules, multi_word_count)
            
            # Get settings (excluding conjugation)
            settings = get_user_settings("custom_practice")
            settings_groups = settings_registry.get_settings_groups(
                get_module_settings_config("custom_practice")
            )
            
            # Get next set of words
            words = engine.get_next_multi_word(settings)
            
            return render_template("custom_practice/practice.html",
                                 words=words,
                                 settings=settings,
                                 settings_groups=settings_groups,
                                 module_name="custom_practice",
                                 session_progress=engine.get_session_progress())
        
        @bp.route("/api/next", methods=["GET"])
        @login_required
        def get_next_words():
            """Get next set of words for practice"""
            if 'custom_practice_modules' not in session:
                return jsonify({'error': 'No active session'}), 400
            
            selected_modules = session['custom_practice_modules']
            multi_word_count = session.get('custom_practice_multi_word_count', 1)
            
            engine = CustomPracticeEngine(selected_modules, multi_word_count)
            settings = get_user_settings("custom_practice")
            
            words = engine.get_next_multi_word(settings)
            
            # Convert words to JSON-serializable format
            words_data = []
            for word in words:
                word_data = {
                    'index': word.index,
                    'kanji': word.kanji,
                    'hiragana': word.hiragana,
                    'katakana': word.katakana,
                    'romaji': word.romaji,
                    'english': word.english,
                    'prompt': word.prompt,
                    'answer': word.answer,
                    'prompt_script': word.prompt_script,
                    'answer_script': word.answer_script,
                    'source_module': getattr(word, 'source_module', ''),
                    'module_type': getattr(word, 'module_type', ''),
                    'display_mode': getattr(word, 'display_mode', ''),
                    'fallback_used': getattr(word, 'fallback_used', False)
                }
                words_data.append(word_data)
            
            return jsonify({
                'words': words_data,
                'session_progress': engine.get_session_progress()
            })
        
        @bp.route("/api/answer", methods=["POST"])
        @login_required
        def submit_answer():
            """Submit answers for current words"""
            if 'custom_practice_modules' not in session:
                return jsonify({'error': 'No active session'}), 400
            
            data = request.get_json()
            answers = data.get('answers', [])
            
            if not answers:
                return jsonify({'error': 'No answers provided'}), 400
            
            selected_modules = session['custom_practice_modules']
            multi_word_count = session.get('custom_practice_multi_word_count', 1)
            
            engine = CustomPracticeEngine(selected_modules, multi_word_count)
            
            # Process answers
            results = []
            all_correct = True
            
            for answer_data in answers:
                word_index = answer_data.get('word_index')
                user_answer = answer_data.get('answer', '').strip()
                
                # Find the word
                word = None
                for w in engine._data:
                    if w.index == word_index:
                        word = w
                        break
                
                if not word:
                    continue
                
                # Check answer using existing validation logic
                # For now, do simple string comparison - can be enhanced later
                correct = user_answer.lower().strip() == word.answer.lower().strip()
                
                results.append({
                    'word_index': word_index,
                    'user_answer': user_answer,
                    'correct_answer': word.answer,
                    'correct': correct,
                    'prompt': word.prompt,
                    'source_module': getattr(word, 'source_module', '')
                })
                
                if not correct:
                    all_correct = False
            
            return jsonify({
                'results': results,
                'all_correct': all_correct,
                'session_progress': engine.get_session_progress()
            })
        
        @bp.route("/api/progress", methods=["GET"])
        @login_required
        def get_progress():
            """Get current session progress"""
            if 'custom_practice_modules' not in session:
                return jsonify({'error': 'No active session'}), 400
            
            selected_modules = session['custom_practice_modules']
            multi_word_count = session.get('custom_practice_multi_word_count', 1)
            
            engine = CustomPracticeEngine(selected_modules, multi_word_count)
            
            return jsonify(engine.get_session_progress())
        
        @bp.route("/api/modules", methods=["GET"])
        @login_required
        def get_available_modules():
            """Get available modules for selection"""
            engine = CustomPracticeEngine([], 1)
            modules = engine.get_available_modules()
            
            return jsonify({'modules': modules})
        
        @bp.route("/settings", methods=["POST"])
        @login_required
        def update_settings():
            """Update custom practice settings"""
            form_data = request.form.to_dict()
            
            # Process settings through registry (excluding conjugation)
            processed_settings = settings_registry.process_settings("custom_practice", form_data)
            
            # Update user settings
            update_user_settings("custom_practice", processed_settings)
            
            return jsonify({'success': True})
        
        @bp.route("/reset", methods=["POST"])
        @login_required
        def reset_session():
            """Reset the current practice session"""
            if 'custom_practice_modules' in session:
                selected_modules = session['custom_practice_modules']
                multi_word_count = session.get('custom_practice_multi_word_count', 1)
                
                engine = CustomPracticeEngine(selected_modules, multi_word_count)
                engine.reset_session()
                
                # Update session data
                session['custom_practice_engine_data']['words_practiced'] = []
            
            return jsonify({'success': True})
        
        return bp
