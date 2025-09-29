"""User settings model schema for database-backed settings."""

from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class UserSettings(Base):
    """User settings table for storing individual setting values per user and module"""
    __tablename__ = 'user_settings'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    module_name = Column(String(50), nullable=False)
    setting_key = Column(String(100), nullable=False)
    setting_value = Column(Text)
    setting_type = Column(String(20), default='string')  # 'string', 'boolean', 'array', 'number'
    is_custom = Column(Boolean, default=False)  # True if user customized from default
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Composite unique constraint to prevent duplicate settings per user/module/key
    __table_args__ = (
        Index('idx_user_module_key', 'user_id', 'module_name', 'setting_key', unique=True),
    )
    
    # Relationships
    user = relationship("User", back_populates="settings")


class UserModulePreferences(Base):
    """User preferences for module-specific settings"""
    __tablename__ = 'user_module_preferences'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    module_name = Column(String(50), nullable=False)
    preferences_data = Column(Text)  # JSON data of user preferences
    last_used = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Ensure one preference record per user per module
    __table_args__ = (
        Index('idx_user_module_prefs', 'user_id', 'module_name', unique=True),
    )
    
    # Relationships
    user = relationship("User", back_populates="module_preferences")


class SettingsMigrationLog(Base):
    """Log of settings migration from localStorage to database"""
    __tablename__ = 'settings_migration_log'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    migration_type = Column(String(50), nullable=False)  # 'localStorage_to_db', 'default_to_custom', etc.
    module_name = Column(String(50))
    migration_data = Column(Text)  # JSON data about what was migrated
    status = Column(String(20), default='pending')  # 'pending', 'completed', 'failed'
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="migration_log")


# Future enhancement: Add indexes for common queries
class ModuleSettingsCache(Base):
    """Cache for expensive module settings computations"""
    __tablename__ = 'module_settings_cache'
    
    id = Column(Integer, primary_key=True)
    module_name = Column(String(50), nullable=False)
    cache_key = Column(String(100), nullable=False)
    cache_data = Column(Text)  # JSON data
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    __table_args__ = (
        Index('idx_module_cache_key', 'module_name', 'cache_key'),
        Index('idx_cache_expires', 'expires_at'),
    )


def create_settings_tables(engine):
    """Create all settings-related tables"""
    Base.metadata.create_all(engine)


def drop_settings_tables(engine):
    """Drop all settings-related tables"""
    Base.metadata.drop_all(engine)
