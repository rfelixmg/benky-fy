"""
Test suite for the refactored settings module.
"""

import pytest
from unittest.mock import patch, MagicMock

from app.settings import get_user_settings, update_user_settings, settings_registry
from app.settings.models.definitions import SettingDefinition, SettingsGroup
from app.settings.plugins.core import CoreSettingsPlugin
from app.settings.plugins.furigana import FuriganaSettingsPlugin
from app.settings.plugins.conjugation import ConjugationSettingsPlugin
from app.settings.plugins.vocabulary import VocabularySettingsPlugin


class TestSettingsImports:
    """Test that all settings module components can be imported."""
    
    def test_module_imports(self):
        """Test that all refactored settings modules can be imported."""
        # Main functions
        assert get_user_settings is not None
        assert update_user_settings is not None
        assert settings_registry is not None
        
        # Models
        assert SettingDefinition is not None
        assert SettingsGroup is not None
        
        # Plugins
        assert CoreSettingsPlugin is not None
        assert FuriganaSettingsPlugin is not None
        assert ConjugationSettingsPlugin is not None
        assert VocabularySettingsPlugin is not None


class TestSettingDefinition:
    """Test SettingDefinition model."""
    
    def test_setting_definition_creation(self):
        """Test creating a SettingDefinition."""
        setting = SettingDefinition(
            name="test_setting",
            default_value="default",
            setting_type="string",
            description="Test setting"
        )
        
        assert setting.name == "test_setting"
        assert setting.default_value == "default"
        assert setting.setting_type == "string"
        assert setting.description == "Test setting"
    
    def test_setting_definition_with_options(self):
        """Test SettingDefinition with options."""
        setting = SettingDefinition(
            name="test_choice",
            default_value="option1",
            setting_type="choice",
            description="Test choice setting",
            options=["option1", "option2", "option3"]
        )
        
        assert setting.options == ["option1", "option2", "option3"]


class TestSettingsGroup:
    """Test SettingsGroup model."""
    
    def test_settings_group_creation(self):
        """Test creating a SettingsGroup."""
        setting1 = SettingDefinition("setting1", "default1", "string", "First setting")
        setting2 = SettingDefinition("setting2", "default2", "string", "Second setting")
        
        group = SettingsGroup(
            name="test_group",
            description="Test settings group",
            settings=[setting1, setting2]
        )
        
        assert group.name == "test_group"
        assert group.description == "Test settings group"
        assert len(group.settings) == 2
        assert group.settings[0].name == "setting1"
        assert group.settings[1].name == "setting2"


class TestCoreSettingsPlugin:
    """Test CoreSettingsPlugin functionality."""
    
    def test_core_plugin_creation(self):
        """Test creating a CoreSettingsPlugin."""
        plugin = CoreSettingsPlugin()
        
        assert plugin is not None
        assert hasattr(plugin, 'get_settings_config')
    
    def test_core_plugin_settings_config(self):
        """Test CoreSettingsPlugin settings configuration."""
        plugin = CoreSettingsPlugin()
        config = plugin.get_settings_config()
        
        assert config is not None
        assert 'display_mode' in config
        assert 'kana_types' in config
        assert 'input_modes' in config
        
        # Check that display_mode has expected options
        display_mode_setting = config['display_mode']
        assert 'kanji' in display_mode_setting['options']
        assert 'hiragana' in display_mode_setting['options']
        assert 'kanji_furigana' in display_mode_setting['options']


class TestFuriganaSettingsPlugin:
    """Test FuriganaSettingsPlugin functionality."""
    
    def test_furigana_plugin_creation(self):
        """Test creating a FuriganaSettingsPlugin."""
        plugin = FuriganaSettingsPlugin()
        
        assert plugin is not None
        assert hasattr(plugin, 'get_settings_config')
    
    def test_furigana_plugin_settings_config(self):
        """Test FuriganaSettingsPlugin settings configuration."""
        plugin = FuriganaSettingsPlugin()
        config = plugin.get_settings_config()
        
        assert config is not None
        assert 'furigana_style' in config
        assert 'furigana_visibility' in config
        
        # Check furigana_style options
        furigana_style_setting = config['furigana_style']
        assert 'ruby' in furigana_style_setting['options']
        assert 'text' in furigana_style_setting['options']
        assert 'hover' in furigana_style_setting['options']


class TestConjugationSettingsPlugin:
    """Test ConjugationSettingsPlugin functionality."""
    
    def test_conjugation_plugin_creation(self):
        """Test creating a ConjugationSettingsPlugin."""
        plugin = ConjugationSettingsPlugin()
        
        assert plugin is not None
        assert hasattr(plugin, 'get_settings_config')
    
    def test_conjugation_plugin_settings_config(self):
        """Test ConjugationSettingsPlugin settings configuration."""
        plugin = ConjugationSettingsPlugin()
        config = plugin.get_settings_config()
        
        assert config is not None
        assert 'conjugation_mode' in config
        assert 'conjugation_forms' in config
        assert 'conjugation_prompt_style' in config


class TestVocabularySettingsPlugin:
    """Test VocabularySettingsPlugin functionality."""
    
    def test_vocabulary_plugin_creation(self):
        """Test creating a VocabularySettingsPlugin."""
        plugin = VocabularySettingsPlugin()
        
        assert plugin is not None
        assert hasattr(plugin, 'get_settings_config')
    
    def test_vocabulary_plugin_settings_config(self):
        """Test VocabularySettingsPlugin settings configuration."""
        plugin = VocabularySettingsPlugin()
        config = plugin.get_settings_config()
        
        assert config is not None
        assert 'weights' in config
        assert 'proportions' in config


class TestSettingsRegistry:
    """Test SettingsRegistry functionality."""
    
    def test_settings_registry_exists(self):
        """Test that settings registry exists and has expected methods."""
        assert settings_registry is not None
        assert hasattr(settings_registry, 'register_plugin')
        assert hasattr(settings_registry, 'get_settings_config')
        assert hasattr(settings_registry, 'get_plugin')
    
    def test_settings_registry_plugin_registration(self):
        """Test registering plugins with settings registry."""
        plugin = CoreSettingsPlugin()
        
        # Test that we can get the plugin
        retrieved_plugin = settings_registry.get_plugin('core')
        assert retrieved_plugin is not None
    
    def test_settings_registry_get_config(self):
        """Test getting settings configuration from registry."""
        config = settings_registry.get_settings_config()
        
        assert config is not None
        assert isinstance(config, dict)
        
        # Should have settings from all registered plugins
        assert 'display_mode' in config  # From core plugin
        assert 'furigana_style' in config  # From furigana plugin


class TestSettingsFunctions:
    """Test settings utility functions."""
    
    def test_get_user_settings_default(self, mock_user_settings):
        """Test getting default user settings."""
        settings = get_user_settings("test_module")
        
        assert isinstance(settings, dict)
        assert 'display_mode' in settings
        assert 'kana_types' in settings
        assert 'input_modes' in settings
    
    def test_update_user_settings(self, mock_user_settings):
        """Test updating user settings."""
        test_settings = {
            'display_mode': 'kanji',
            'kana_types': ['hiragana'],
            'input_modes': ['romaji']
        }
        
        update_user_settings("test_module", test_settings)
        retrieved_settings = get_user_settings("test_module")
        
        assert retrieved_settings['display_mode'] == 'kanji'
        assert retrieved_settings['kana_types'] == ['hiragana']
        assert retrieved_settings['input_modes'] == ['romaji']
    
    def test_get_user_settings_after_update(self, mock_user_settings):
        """Test getting user settings after update."""
        # Update settings
        test_settings = {
            'display_mode': 'kanji_furigana',
            'furigana_style': 'ruby'
        }
        update_user_settings("test_module", test_settings)
        
        # Retrieve settings
        retrieved_settings = get_user_settings("test_module")
        
        assert retrieved_settings['display_mode'] == 'kanji_furigana'
        assert retrieved_settings['furigana_style'] == 'ruby'
    
    def test_get_user_settings_module_isolation(self, mock_user_settings):
        """Test that settings are isolated per module."""
        # Set different settings for different modules
        update_user_settings("module1", {'display_mode': 'kanji'})
        update_user_settings("module2", {'display_mode': 'hiragana'})
        
        # Retrieve settings
        settings1 = get_user_settings("module1")
        settings2 = get_user_settings("module2")
        
        assert settings1['display_mode'] == 'kanji'
        assert settings2['display_mode'] == 'hiragana'
    
    def test_get_module_settings_config(self):
        """Test getting module settings configuration."""
        from app.settings import get_module_settings_config
        
        config = get_module_settings_config("test_module")
        
        assert config is not None
        assert isinstance(config, dict)
        assert 'display_mode' in config
        assert 'furigana_style' in config
