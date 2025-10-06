from .base import DatabaseInterface, db_manager, db
from flask_sqlalchemy import SQLAlchemy
from typing import Dict, Any

class UserDatabaseInterface(DatabaseInterface):
    """Database interface for user-related operations."""
    
    def __init__(self):
        super().__init__(db)
        self._models = {}
    
    def create_tables(self) -> None:
        """Create user-related tables."""
        # Import user models here to avoid circular imports
        from ..models.user import User
        self._models['User'] = User
        db.create_all()
    
    def get_models(self) -> Dict[str, Any]:
        """Return user models."""
        if not self._models:
            from ..models.user import User
            self._models['User'] = User
        return self._models
    
    def get_user_by_id(self, user_id: str) -> Any:
        """Get user by ID."""
        User = self.get_models()['User']
        return User.query.filter_by(id=user_id).first()
    
    def get_user_by_email(self, email: str) -> Any:
        """Get user by email."""
        User = self.get_models()['User']
        return User.query.filter_by(email=email).first()
    
    def create_user(self, user_data: Dict[str, Any]) -> Any:
        """Create a new user."""
        User = self.get_models()['User']
        user = User(**user_data)
        db.session.add(user)
        db.session.commit()
        return user

# Register the user interface
user_db = UserDatabaseInterface()
db_manager.register_interface('user', user_db)
