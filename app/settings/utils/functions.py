"""Settings utility functions."""

from typing import Dict, List, Any
from flask import session
from ..registry.registry import SettingsRegistry

# Global registry instance
settings_registry = SettingsRegistry()


def get_module_settings_config(module_name: str) -> List[str]:
    """Get settings configuration for a module"""
    # Custom practice excludes conjugation settings
    if module_name == "custom_practice":
        return ["core", "furigana", "vocabulary"]
    
    # For all other modules, return all available settings
    return ["core", "furigana", "conjugation", "vocabulary"]


def get_user_settings(module_name: str) -> Dict[str, Any]:
    """Get user settings for a module from session"""
    session_key = f"flashcard_settings_{module_name}"
    settings = session.get(session_key, {})
    
    # If no settings found, return defaults
    if not settings:
        settings = settings_registry.get_default_settings()
        session[session_key] = settings
    
    return settings


def update_user_settings(module_name: str, form_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update user settings for a module"""
    # Process settings through registry
    processed_settings = settings_registry.process_settings(module_name, form_data)
    
    # Store in session
    session_key = f"flashcard_settings_{module_name}"
    session[session_key] = processed_settings
    
    return processed_settings
