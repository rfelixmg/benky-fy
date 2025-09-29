"""Settings registry implementation."""

from typing import Dict, List, Any
from ..models.definitions import SettingsPlugin, SettingsGroup
from ..plugins.core import CoreSettingsPlugin
from ..plugins.furigana import FuriganaSettingsPlugin
from ..plugins.conjugation import ConjugationSettingsPlugin
from ..plugins.vocabulary import VocabularySettingsPlugin
from ..config.module_configs import get_module_config, ModuleSettingsConfig


class SettingsRegistry:
    """Registry for managing settings plugins"""
    
    def __init__(self):
        self.plugins: List[SettingsPlugin] = [
            CoreSettingsPlugin(),
            FuriganaSettingsPlugin(),
            ConjugationSettingsPlugin(),
            VocabularySettingsPlugin()
        ]
    
    def get_settings_groups(self, module_config: List[str] = None) -> List[SettingsGroup]:
        """Get all settings groups for a module configuration"""
        all_groups = []
        
        for plugin in self.plugins:
            groups = plugin.get_settings_groups(module_config)
            all_groups.extend(groups)
        
        return all_groups
    
    def get_module_settings_groups(self, module_name: str) -> List[SettingsGroup]:
        """Get settings groups filtered by module configuration"""
        module_config = get_module_config(module_name)
        
        filtered_groups = []
        for plugin in self.plugins:
            groups = plugin.get_settings_groups(module_config)
            filtered_groups.extend(groups)
        
        return filtered_groups
    
    def get_default_settings_for_module(self, module_name: str) -> Dict[str, Any]:
        """Get default settings for specific module"""
        module_config = get_module_config(module_name)
        return module_config.default_settings.copy()
    
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
