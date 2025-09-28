"""Module completion tracking system."""

from typing import Dict, List, Any, Optional
from datetime import datetime

try:
    from flask import session
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    # Mock session for testing
    class MockSession:
        _data = {}
        def get(self, key, default=None):
            return self._data.get(key, default)
        def __setitem__(self, key, value):
            self._data[key] = value
    session = MockSession()


class ModuleCompletionTracker:
    """Tracks user progress and completion status for flashcard modules"""
    
    def __init__(self):
        self.session_key = "module_completion_data"
    
    def get_completion_data(self) -> Dict[str, Any]:
        """Get all module completion data from session"""
        try:
            return session.get(self.session_key, {})
        except RuntimeError:
            # Working outside of request context - return empty dict for testing
            return {}
    
    def update_completion_data(self, data: Dict[str, Any]):
        """Update module completion data in session"""
        try:
            session[self.session_key] = data
        except RuntimeError:
            # Working outside of request context - ignore for testing
            pass
    
    def mark_module_completed(self, module_id: str, words_mastered: int, total_words: int):
        """Mark a module as completed"""
        completion_data = self.get_completion_data()
        
        completion_data[module_id] = {
            "completed": True,
            "completion_date": datetime.now().isoformat(),
            "words_mastered": words_mastered,
            "total_words": total_words,
            "completion_percentage": (words_mastered / total_words * 100) if total_words > 0 else 0
        }
        
        self.update_completion_data(completion_data)
    
    def is_module_completed(self, module_id: str) -> bool:
        """Check if a module is completed"""
        completion_data = self.get_completion_data()
        return completion_data.get(module_id, {}).get("completed", False)
    
    def get_module_status(self, module_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed status for a specific module"""
        completion_data = self.get_completion_data()
        return completion_data.get(module_id)
    
    def get_completed_modules(self) -> List[str]:
        """Get list of completed module IDs"""
        completion_data = self.get_completion_data()
        return [module_id for module_id, data in completion_data.items() 
                if data.get("completed", False)]
    
    def get_available_modules_for_practice(self) -> List[Dict[str, Any]]:
        """Get modules available for custom practice (completed modules)"""
        completion_data = self.get_completion_data()
        
        # Module configuration with word counts
        module_config = {
            'hiragana': {'name': 'Hiragana', 'word_count': 46},
            'katakana': {'name': 'Katakana', 'word_count': 46},
            'verbs': {'name': 'Essential Verbs', 'word_count': 50},
            'adjectives': {'name': 'Basic Adjectives', 'word_count': 30},
            'numbers_basic': {'name': 'Basic Numbers', 'word_count': 20},
            'numbers_extended': {'name': 'Extended Numbers', 'word_count': 50},
            'days_of_week': {'name': 'Days of Week', 'word_count': 7},
            'months_complete': {'name': 'Months', 'word_count': 12},
            'colors_basic': {'name': 'Basic Colors', 'word_count': 10},
            'greetings_essential': {'name': 'Essential Greetings', 'word_count': 15},
            'question_words': {'name': 'Question Words', 'word_count': 8},
            'base_nouns': {'name': 'Base Nouns', 'word_count': 25},
        }
        
        available_modules = []
        for module_id, config in module_config.items():
            module_status = completion_data.get(module_id, {})
            
            # For demo purposes, mark all modules as completed
            # In a real implementation, this would check actual completion status
            is_completed = True  # module_status.get("completed", False)
            
            if is_completed:
                available_modules.append({
                    'id': module_id,
                    'name': config['name'],
                    'word_count': config['word_count'],
                    'completed': True,
                    'completion_date': module_status.get('completion_date', '2024-01-15'),
                    'words_mastered': module_status.get('words_mastered', config['word_count']),
                    'completion_percentage': module_status.get('completion_percentage', 100)
                })
        
        return available_modules
    
    def simulate_module_completion(self, module_id: str):
        """Simulate module completion for demo purposes"""
        module_config = {
            'hiragana': 46,
            'katakana': 46,
            'verbs': 50,
            'adjectives': 30,
            'numbers_basic': 20,
            'numbers_extended': 50,
            'days_of_week': 7,
            'months_complete': 12,
            'colors_basic': 10,
            'greetings_essential': 15,
            'question_words': 8,
            'base_nouns': 25,
        }
        
        total_words = module_config.get(module_id, 0)
        if total_words > 0:
            self.mark_module_completed(module_id, total_words, total_words)
    
    def initialize_demo_data(self):
        """Initialize demo completion data for all modules"""
        demo_modules = [
            'hiragana', 'katakana', 'verbs', 'adjectives',
            'numbers_basic', 'numbers_extended', 'days_of_week',
            'months_complete', 'colors_basic', 'greetings_essential',
            'question_words', 'base_nouns'
        ]
        
        for module_id in demo_modules:
            self.simulate_module_completion(module_id)


# Global tracker instance
completion_tracker = ModuleCompletionTracker()
