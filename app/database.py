# Legacy compatibility - import from new modular structure
from .database import db, init_database, db_manager
from .database.user import user_db
from .database.flashcard import flashcard_db

# Re-export for backward compatibility
__all__ = ['db', 'init_database', 'db_manager', 'user_db', 'flashcard_db']
