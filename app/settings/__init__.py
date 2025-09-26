"""
Centralized Settings System for Flashcard Modules

This module provides a plugin-based architecture for managing flashcard settings,
making it easy to add new features without modifying multiple files.

Refactored from monolithic settings.py into focused submodules:
- models/: Data models and structures
- plugins/: Settings plugin implementations
- registry/: Settings registry and management
- utils/: Utility functions for settings operations
"""

# Import all public APIs to maintain backward compatibility
from .models.definitions import SettingDefinition, SettingsGroup, SettingsPlugin
from .plugins.core import CoreSettingsPlugin
from .plugins.furigana import FuriganaSettingsPlugin
from .plugins.conjugation import ConjugationSettingsPlugin
from .plugins.vocabulary import VocabularySettingsPlugin
from .registry.registry import SettingsRegistry
from .utils.functions import get_module_settings_config, get_user_settings, update_user_settings

# Export all public APIs
__all__ = [
    'SettingDefinition',
    'SettingsGroup', 
    'SettingsPlugin',
    'CoreSettingsPlugin',
    'FuriganaSettingsPlugin',
    'ConjugationSettingsPlugin',
    'VocabularySettingsPlugin',
    'SettingsRegistry',
    'get_module_settings_config',
    'get_user_settings',
    'update_user_settings'
]

# Create global registry instance for backward compatibility
settings_registry = SettingsRegistry()
