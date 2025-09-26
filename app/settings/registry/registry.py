"""Settings registry implementation."""

from typing import Dict, List, Any
from ..models.definitions import SettingsPlugin, SettingsGroup
from ..plugins.core import CoreSettingsPlugin
from ..plugins.furigana import FuriganaSettingsPlugin
from ..plugins.conjugation import ConjugationSettingsPlugin
from ..plugins.vocabulary import VocabularySettingsPlugin


class SettingsRegistry:
    """Registry for managing settings plugins"""
    
    def __init__(self):
        self.plugins: List[SettingsPlugin] = [
            CoreSettingsPlugin(),
            FuriganaSettingsPlugin(),
            ConjugationSettingsPlugin(),
            VocabularySettingsPlugin()
        ]
    
    def get_settings_groups(self, module_config: List[str]) -> List[SettingsGroup]:
        """Get all settings groups for a module configuration"""
        all_groups = []
        
        for plugin in self.plugins:
            groups = plugin.get_settings_groups()
            all_groups.extend(groups)
        
        return all_groups
    
    def process_settings(self, module_name: str, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process settings through all plugins"""
        processed_settings = {}
        
        for plugin in self.plugins:
            plugin_settings = plugin.process_settings(form_data)
            processed_settings.update(plugin_settings)
        
        return processed_settings
    
    def get_default_settings(self) -> Dict[str, Any]:
        """Get default settings from all plugins"""
        default_settings = {}
        
        for plugin in self.plugins:
            plugin_defaults = plugin.get_default_settings()
            default_settings.update(plugin_defaults)
        
        return default_settings
