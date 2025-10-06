from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from datetime import datetime
from ..database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    auth0_id = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture = Column(Text, nullable=True)
    provider = Column(String(50), nullable=False, default='auth0')
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'picture': self.picture,
            'provider': self.provider,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }
