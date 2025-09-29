"""Module-specific settings configurations."""

from typing import Dict, List, Any
from dataclasses import dataclass


@dataclass
class ModuleSettingsConfig:
    """Configuration for module-specific settings"""
    module_name: str
    default_settings: Dict[str, Any]
    available_options: Dict[str, List[str]]  # {setting_key: [allowed_values]}
    restricted_options: Dict[str, List[str]] # {setting_key: [disabled_values]}


MODULE_SETTINGS_CONFIGS = {
    'hiragana': ModuleSettingsConfig(
        module_name='hiragana',
        default_settings={
            'display_mode': 'kana',
            'kana_types': ['hiragana'],
            'input_modes': ['hiragana'],
            'enable_conjugation': False
        },
        available_options={
            'display_mode': ['kana'],
            'kana_types': [['hiragana'], ['hiragana', 'romaji']],
            'input_modes': [['hiragana'], ['romaji'], ['hiragana', 'romaji']],
            'furigana_style': []  # Not available
        },
        restricted_options={
            'kanji_options': ['kanji', 'kanji_furigana'],  # Explicitly disabled
            'conjugation': ['enable_conjugation']
        }
    ),
    
    'katakana': ModuleSettingsConfig(
        module_name='katakana',
        default_settings={
            'display_mode': 'kana',
            'kana_types': ['katakana'],
            'input_modes': ['katakana'],
            'enable_conjugation': False
        },
        available_options={
            'display_mode': ['kana'],
            'kana_types': [['katakana'], ['katakana', 'romaji']],
            'input_modes': [['katakana'], ['romaji'], ['katakana', 'romaji']],
            'furigana_style': []
        },
        restricted_options={
            'kanji_options': ['kanji', 'kanji_furigana'],
            'conjugation': ['enable_conjugation']
        }
    ),
    
    'katakana_words': ModuleSettingsConfig(
        module_name='katakana_words',
        default_settings={
            'display_mode': 'kana',
            'kana_types': ['katakana'],
            'input_modes': ['katakana', 'english'],
            'furigana_style': 'ruby',
            'enable_conjugation': False
        },
        available_options={
            'display_mode': ['kana'],
            'kana_types': [['katakana']],
            'input_modes': [['katakana'], ['english'], ['katakana', 'english']],
            'furigana_style': ['ruby', 'hover', 'inline']
        },
        restricted_options={
            'kanji_options': ['kanji', 'kanji_furigana'],
            'conjugation': ['enable_conjugation']
        }
    ),
    
    'verbs': ModuleSettingsConfig(
        module_name='verbs',
        default_settings={
            'display_mode': 'weighted',
            'kana_types': ['hiragana'],
            'kanji_options': ['kanji_furigana'],
            'input_modes': ['hiragana', 'english'],
            'furigana_style': 'hover',
            'enable_conjugation': True,
            'conjugation_forms': ['polite', 'negative']
        },
        available_options={
            'display_mode': ['weighted', 'kanji', 'kana'],
            'kana_types': [['hiragana'], ['romaji'], ['hiragana', 'romaji']],
            'kanji_options': [['kanji'], ['kanji_furigana'], ['kanji', 'kanji_furigana']],
            'input_modes': [['hiragana'], ['english'], ['hiragana', 'english']],
            'furigana_style': ['ruby', 'hover', 'inline', 'brackets'],
            'enable_conjugation': [True, False],
            'conjugation_forms': [['polite'], ['negative'], ['polite', 'negative']]
        },
        restricted_options={}
    ),
    
    'adjectives': ModuleSettingsConfig(
        module_name='adjectives',
        default_settings={
            'display_mode': 'weighted',
            'kana_types': ['hiragana'],
            'kanji_options': ['kanji_furigana'],
            'input_modes': ['hiragana', 'english'],
            'furigana_style': 'hover',
            'enable_conjugation': True,
            'conjugation_forms': ['polite', 'negative']
        },
        available_options={
            'display_mode': ['weighted', 'kanji', 'kana'],
            'kana_types': [['hiragana'], ['romaji'], ['hiragana', 'romaji']],
            'kanji_options': [['kanji'], ['kanji_furigana'], ['kanji', 'kanji_furigana']],
            'input_modes': [['hiragana'], ['english'], ['hiragana', 'english']],
            'furigana_style': ['ruby', 'hover', 'inline', 'brackets'],
            'enable_conjugation': [True, False],
            'conjugation_forms': [['polite'], ['negative'], ['polite', 'negative']]
        },
        restricted_options={}
    ),
    
    # Vocabulary modules (vocab, numbers, colors, greetings, etc.)
    'vocabulary': ModuleSettingsConfig(
        module_name='vocabulary',
        default_settings={
            'display_mode': 'weighted',
            'kana_types': ['hiragana'],
            'kanji_options': ['kanji_furigana'],
            'input_modes': ['hiragana', 'english'],
            'furigana_style': 'hover',
            'enable_conjugation': False
        },
        available_options={
            'display_mode': ['weighted', 'kanji', 'kana'],
            'kana_types': [['hiragana'], ['romaji'], ['hiragana', 'romaji']],
            'kanji_options': [['kanji'], ['kanji_furigana'], ['kanji', 'kanji_furigana']],
            'input_modes': [['hiragana'], ['english'], ['hiragana', 'english']],
            'furigana_style': ['ruby', 'hover', 'inline', 'brackets']
        },
        restricted_options={
            'conjugation': ['enable_conjugation']
        }
    )
}


def get_module_config(module_name: str) -> ModuleSettingsConfig:
    """Get configuration for a specific module"""
    return MODULE_SETTINGS_CONFIGS.get(module_name, MODULE_SETTINGS_CONFIGS['vocabulary'])


def get_default_settings_for_module(module_name: str) -> Dict[str, Any]:
    """Get default settings for a specific module"""
    config = get_module_config(module_name)
    return config.default_settings.copy()


def validate_setting_for_module(module_name: str, setting_key: str, value: Any) -> bool:
    """Validate if a setting value is allowed for a module"""
    config = get_module_config(module_name)
    
    # Check if setting is restricted
    restricted_values = config.restricted_options.get(setting_key, [])
    if value in restricted_values:
        return False
    
    # Check available options (if specified)
    available_values = config.available_options.get(setting_key, [])
    if available_values and value not in available_values:
        return False
    
    return True


def filter_settings_for_module(module_name: str, settings: Dict[str, Any]) -> Dict[str, Any]:
    """Filter settings dictionary to only include valid settings for the module"""
    config = get_module_config(module_name)
    filtered_settings = {}
    
    for key, value in settings.items():
        if validate_setting_for_module(module_name, key, value):
            filtered_settings[key] = value
        else:
            # Use default if setting is not valid
            filtered_settings[key] = config.default_settings.get(key, value)
    
    return filtered_settings
