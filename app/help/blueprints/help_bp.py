"""Help blueprint for word information API endpoints."""

from flask import Blueprint, request, jsonify
from typing import Optional
from ...auth import login_required
from ..engines.word_info_engine import WordInfoEngine
from ...flashcard.engines.base import BaseFlashcardEngine


class HelpBlueprint:
    """Blueprint for help functionality API endpoints."""
    
    def __init__(self):
        self.word_info_engine = WordInfoEngine()
    
    def create_blueprint(self) -> Blueprint:
        """Create the help blueprint with all routes."""
        bp = Blueprint('help', __name__, url_prefix='/help')
        
        @bp.route('/api/word-info', methods=['GET'])
        @login_required
        def get_word_info():
            """Get detailed word information for help modal."""
            try:
                # Get parameters
                module_name = request.args.get('module_name')
                item_id = request.args.get('item_id')
                
                if not module_name or not item_id:
                    return jsonify({'error': 'module_name and item_id are required'}), 400
                
                # Get the flashcard engine for the module
                engine = self._get_flashcard_engine(module_name)
                if not engine:
                    return jsonify({'error': f'Module {module_name} not found'}), 404
                
                # Get item data
                try:
                    item_id = int(item_id)
                    item_data = engine[item_id - 1]  # Convert from 1-based to 0-based
                except (ValueError, IndexError):
                    return jsonify({'error': 'Invalid item_id'}), 400
                
                # Extract word information
                word_info = self.word_info_engine.extract_word_info(
                    item_data.__dict__ if hasattr(item_data, '__dict__') else item_data,
                    module_name,
                    item_id
                )
                
                # Get display information
                display_info = self.word_info_engine.get_display_info(word_info)
                
                return jsonify({
                    'success': True,
                    'word_info': word_info.to_dict(),
                    'display_info': display_info,
                    'message': 'Word information retrieved successfully'
                })
                
            except Exception as e:
                return jsonify({'error': f'Failed to get word info: {str(e)}'}), 500
        
        @bp.route('/api/test-word-info', methods=['GET'])
        def test_word_info():
            """Test endpoint for word information (no authentication required)."""
            try:
                # Get parameters
                module_name = request.args.get('module_name', 'verbs')
                item_id = request.args.get('item_id', '1')
                
                # Get the flashcard engine for the module
                engine = self._get_flashcard_engine(module_name)
                if not engine:
                    return jsonify({'error': f'Module {module_name} not found'}), 404
                
                # Get item data
                try:
                    item_id = int(item_id)
                    item_data = engine[item_id - 1]  # Convert from 1-based to 0-based
                except (ValueError, IndexError):
                    return jsonify({'error': 'Invalid item_id'}), 400
                
                # Extract word information
                word_info = self.word_info_engine.extract_word_info(
                    item_data.__dict__ if hasattr(item_data, '__dict__') else item_data,
                    module_name,
                    item_id
                )
                
                # Get display information
                display_info = self.word_info_engine.get_display_info(word_info)
                
                return jsonify({
                    'success': True,
                    'word_info': word_info.to_dict(),
                    'display_info': display_info,
                    'message': 'Test word information retrieved successfully'
                })
                
            except Exception as e:
                return jsonify({'error': f'Failed to get test word info: {str(e)}'}), 500
        
        return bp
    
    def _get_flashcard_engine(self, module_name: str) -> Optional[BaseFlashcardEngine]:
        """Get the flashcard engine for a given module."""
        try:
            # Import here to avoid circular imports
            from ..flashcard.engines import get_engine_for_module
            
            return get_engine_for_module(module_name)
        except ImportError:
            # Fallback: try to get engine from app context
            from flask import current_app
            if hasattr(current_app, 'flashcard_engines'):
                return current_app.flashcard_engines.get(module_name)
            return None
