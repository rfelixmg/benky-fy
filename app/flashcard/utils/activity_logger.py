from ...utils.logger import logger
from typing import Dict, Any, Optional

def log_flashcard_activity(
    action: str,
    module: str,
    user_email: str,
    details: Optional[Dict[str, Any]] = None
):
    """Log flashcard-related user activities"""
    logger.log_user_action(
        action=action,
        module=module,
        details={
            'user_email': user_email,
            **(details or {})
        }
    )

def log_study_progress(
    module: str,
    user_email: str,
    correct: bool,
    card_id: str,
    time_taken_ms: float
):
    """Log study progress and performance metrics"""
    logger.log_user_action(
        action='answer_card',
        module=module,
        details={
            'user_email': user_email,
            'card_id': card_id,
            'correct': correct,
            'time_taken_ms': time_taken_ms
        }
    )

def log_module_completion(
    module: str,
    user_email: str,
    total_cards: int,
    correct_cards: int,
    time_taken_ms: float
):
    """Log module completion statistics"""
    accuracy = (correct_cards / total_cards) * 100 if total_cards > 0 else 0
    logger.log_user_action(
        action='complete_module',
        module=module,
        details={
            'user_email': user_email,
            'total_cards': total_cards,
            'correct_cards': correct_cards,
            'accuracy': accuracy,
            'time_taken_ms': time_taken_ms
        }
    )
