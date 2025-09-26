"""
Centralized Settings System for Flashcard Modules

This module provides a plugin-based architecture for managing flashcard settings,
making it easy to add new features without modifying multiple files.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable, Type
from abc import ABC, abstractmethod
from flask import request, session
import json


@dataclass
class SettingDefinition:
    """Definition of a single setting"""
    key: str
    name: str
    description: str
    type: str  # 'checkbox', 'radio', 'select', 'text', 'number'
    default_value: Any
    options: Optional[Dict[str, str]] = None  # For radio/select: {value: label}
    validation: Optional[Callable] = None
    dependencies: Optional[List[str]] = None  # Other settings this depends on


@dataclass
class SettingsGroup:
    """A group of related settings"""
    name: str
    description: str
    settings: List[SettingDefinition] = field(default_factory=list)
    condition: Optional[Callable[[Dict], bool]] = None  # When to show this group


class SettingsPlugin(ABC):
    """Base class for settings plugins"""
    
    @abstractmethod
    def get_settings_groups(self) -> List[SettingsGroup]:
        """Return the settings groups this plugin provides"""
        pass
    
    @abstractmethod
    def process_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Process and validate settings after form submission"""
        pass
    
    @abstractmethod
    def get_default_settings(self) -> Dict[str, Any]:
        """Return default values for this plugin's settings"""
        pass


class CoreSettingsPlugin(SettingsPlugin):
    """Core flashcard settings (styles, checking modes)"""
    
    def get_settings_groups(self) -> List[SettingsGroup]:
        return [
            SettingsGroup(
                name="Flashcard Type",
                description="Choose the type of flashcard practice",
                settings=[
                    SettingDefinition(
                        key="flashcard_type",
                        name="Flashcard type",
                        description="Translation or conjugation practice",
                        type="radio",
                        default_value="translation",
                        options={
                            "translation": "Translation (word → meaning)",
                            "conjugation": "Conjugation (word → conjugated form)"
                        }
                    )
                ]
            ),
            SettingsGroup(
                name="Display Mode",
                description="How flashcards are displayed",
                settings=[
                    SettingDefinition(
                        key="display_mode",
                        name="Display mode",
                        description="How to show the flashcard content",
                        type="radio",
                        default_value="kana",
                        options={
                            "kana": "Kana only (hiragana/katakana)",
                            "kanji": "Kanji only",
                            "kanji_furigana": "Kanji with furigana",
                            "english": "English only",
                            "weighted": "Mixed display (weighted)"
                        }
                    ),
                    SettingDefinition(
                        key="kana_type",
                        name="Kana type",
                        description="Which kana script to use",
                        type="radio",
                        default_value="hiragana",
                        options={
                            "hiragana": "Hiragana (ひらがな)",
                            "katakana": "Katakana (カタカナ)"
                        },
                        dependencies=["display_mode"]
                    )
                ]
            ),
            SettingsGroup(
                name="Input Modes",
                description="What you want to practice typing",
                settings=[
                    SettingDefinition(
                        key="input_hiragana",
                        name="Hiragana",
                        description="Practice typing hiragana",
                        type="checkbox",
                        default_value=False
                    ),
                    SettingDefinition(
                        key="input_romaji",
                        name="Romaji",
                        description="Practice typing romaji",
                        type="checkbox",
                        default_value=False
                    ),
                    SettingDefinition(
                        key="input_katakana",
                        name="Katakana",
                        description="Practice typing katakana",
                        type="checkbox",
                        default_value=False
                    ),
                    SettingDefinition(
                        key="input_kanji",
                        name="Kanji",
                        description="Practice typing kanji",
                        type="checkbox",
                        default_value=False
                    ),
                    SettingDefinition(
                        key="input_english",
                        name="English",
                        description="Practice typing English",
                        type="checkbox",
                        default_value=True
                    )
                ]
            ),
            SettingsGroup(
                name="Weighted Display",
                description="Control mixed display proportions",
                settings=[
                    SettingDefinition(
                        key="proportion_kana",
                        name="Kana proportion",
                        description="Proportion of kana-only cards",
                        type="number",
                        default_value=0.3
                    ),
                    SettingDefinition(
                        key="proportion_kanji",
                        name="Kanji proportion",
                        description="Proportion of kanji-only cards",
                        type="number",
                        default_value=0.2
                    ),
                    SettingDefinition(
                        key="proportion_kanji_furigana",
                        name="Kanji+furigana proportion",
                        description="Proportion of kanji with furigana cards",
                        type="number",
                        default_value=0.2
                    ),
                    SettingDefinition(
                        key="proportion_english",
                        name="English proportion",
                        description="Proportion of English-only cards",
                        type="number",
                        default_value=0.3
                    )
                ],
                condition=lambda settings: settings.get("display_mode") == "weighted"
            )
        ]
    
    def process_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        # Process input modes
        input_modes = []
        for key, value in settings.items():
            if key.startswith("input_") and value:
                input_modes.append(key.replace("input_", ""))
        
        # Ensure at least one input mode is selected
        if not input_modes:
            input_modes = ["english"]
        
        # Process proportions for weighted mode
        proportions = {}
        if settings.get("display_mode") == "weighted":
            proportions = {
                "kana": float(settings.get("proportion_kana", 0.3)),
                "kanji": float(settings.get("proportion_kanji", 0.2)),
                "kanji_furigana": float(settings.get("proportion_kanji_furigana", 0.2)),
                "english": float(settings.get("proportion_english", 0.3))
            }
            
            # Normalize proportions to sum to 1.0
            total = sum(proportions.values())
            if total > 0:
                for key in proportions:
                    proportions[key] = proportions[key] / total
        
        return {
            "flashcard_type": settings.get("flashcard_type", "translation"),
            "display_mode": settings.get("display_mode", "kana"),
            "kana_type": settings.get("kana_type", "hiragana"),
            "input_modes": input_modes,
            "proportions": proportions
        }
    
    def get_default_settings(self) -> Dict[str, Any]:
        return {
            "flashcard_type": "translation",
            "display_mode": "kana",
            "kana_type": "hiragana",
            "input_hiragana": False,
            "input_romaji": False,
            "input_katakana": False,
            "input_kanji": False,
            "input_english": True,
            "proportion_kana": 0.3,
            "proportion_kanji": 0.2,
            "proportion_kanji_furigana": 0.2,
            "proportion_english": 0.3,
            "input_modes": ["english"],
            "proportions": {
                "kana": 0.3,
                "kanji": 0.2,
                "kanji_furigana": 0.2,
                "english": 0.3
            }
        }


class FuriganaSettingsPlugin(SettingsPlugin):
    """Furigana display settings"""
    
    def get_settings_groups(self) -> List[SettingsGroup]:
        return [
            SettingsGroup(
                name="Furigana Display",
                description="Control how furigana (reading aids) are displayed",
                settings=[
                    SettingDefinition(
                        key="show_furigana",
                        name="Show furigana",
                        description="Display reading aids above kanji",
                        type="checkbox",
                        default_value=True
                    ),
                    SettingDefinition(
                        key="furigana_style",
                        name="Furigana style",
                        description="How to display furigana",
                        type="radio",
                        default_value="html",
                        options={
                            "html": "HTML ruby tags (recommended)",
                            "text": "Text brackets [furigana]"
                        },
                        dependencies=["show_furigana"]
                    )
                ]
            )
        ]
    
    def process_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "show_furigana": bool(settings.get("show_furigana", True)),
            "furigana_style": settings.get("furigana_style", "html")
        }
    
    def get_default_settings(self) -> Dict[str, Any]:
        return {
            "show_furigana": True,
            "furigana_style": "html"
        }


class ConjugationSettingsPlugin(SettingsPlugin):
    """Conjugation practice settings"""
    
    def __init__(self, module_type: str = "verb"):
        self.module_type = module_type
    
    def get_settings_groups(self) -> List[SettingsGroup]:
        if self.module_type == "verb":
            conjugation_forms = [
                SettingDefinition(
                    key="conjugation_forms_dictionary",
                    name="Dictionary (辞書形)",
                    description="Base form of the verb",
                    type="checkbox",
                    default_value=False
                ),
                SettingDefinition(
                    key="conjugation_forms_polite",
                    name="Polite (ます形)",
                    description="Polite form ending in ます",
                    type="checkbox",
                    default_value=True
                ),
                SettingDefinition(
                    key="conjugation_forms_negative",
                    name="Negative (ない形)",
                    description="Negative form ending in ない",
                    type="checkbox",
                    default_value=True
                ),
                SettingDefinition(
                    key="conjugation_forms_past",
                    name="Past (た形)",
                    description="Past tense form",
                    type="checkbox",
                    default_value=False
                ),
                SettingDefinition(
                    key="conjugation_forms_te_form",
                    name="Te-form (て形)",
                    description="Te-form for connecting verbs",
                    type="checkbox",
                    default_value=False
                )
            ]
        else:  # adjective
            conjugation_forms = [
                SettingDefinition(
                    key="conjugation_forms_present",
                    name="Present (現在形)",
                    description="Present tense form",
                    type="checkbox",
                    default_value=False
                ),
                SettingDefinition(
                    key="conjugation_forms_past",
                    name="Past (過去形)",
                    description="Past tense form",
                    type="checkbox",
                    default_value=True
                ),
                SettingDefinition(
                    key="conjugation_forms_negative",
                    name="Negative (否定形)",
                    description="Negative form",
                    type="checkbox",
                    default_value=True
                ),
                SettingDefinition(
                    key="conjugation_forms_adverbial",
                    name="Adverbial (連用形)",
                    description="Adverbial form ending in く",
                    type="checkbox",
                    default_value=False
                )
            ]
        
        return [
            SettingsGroup(
                name="Conjugation Practice",
                description="Practice conjugating words in different forms",
                settings=[
                    SettingDefinition(
                        key="conjugation_mode",
                        name="Enable conjugation practice",
                        description="Switch to conjugation practice mode",
                        type="checkbox",
                        default_value=False
                    ),
                    SettingDefinition(
                        key="conjugation_prompt_style",
                        name="Prompt style",
                        description="How to present conjugation prompts",
                        type="radio",
                        default_value="english",
                        options={
                            "english": "English prompts (e.g., 'Conjugate \"to eat\" in polite form')",
                            "hiragana": "Hiragana prompts (e.g., 'Conjugate \"たべる\" in polite form')"
                        },
                        dependencies=["conjugation_mode"]
                    )
                ] + conjugation_forms
            )
        ]
    
    def process_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        # Collect conjugation forms
        conjugation_forms = []
        for key, value in settings.items():
            if key.startswith("conjugation_forms_") and value:
                form_name = key.replace("conjugation_forms_", "")
                conjugation_forms.append(form_name)
        
        # Use default forms if none selected
        if not conjugation_forms:
            conjugation_forms = ["polite", "negative"] if self.module_type == "verb" else ["past", "negative"]
        
        return {
            "conjugation_mode": bool(settings.get("conjugation_mode", False)),
            "conjugation_prompt_style": settings.get("conjugation_prompt_style", "english"),
            "conjugation_forms": conjugation_forms
        }
    
    def get_default_settings(self) -> Dict[str, Any]:
        default_forms = ["polite", "negative"] if self.module_type == "verb" else ["past", "negative"]
        return {
            "conjugation_mode": False,
            "conjugation_prompt_style": "english",
            "conjugation_forms": default_forms,
            "conjugation_forms_polite": self.module_type == "verb",
            "conjugation_forms_negative": True,
            "conjugation_forms_past": self.module_type == "adjective",
            "conjugation_forms_dictionary": False,
            "conjugation_forms_te_form": False,
            "conjugation_forms_present": False,
            "conjugation_forms_adverbial": False
        }


class VocabularySettingsPlugin(SettingsPlugin):
    """Vocabulary-specific settings"""
    
    def get_settings_groups(self) -> List[SettingsGroup]:
        return [
            SettingsGroup(
                name="Learning Options",
                description="Control how vocabulary is presented",
                settings=[
                    SettingDefinition(
                        key="priority_filter",
                        name="Priority filter",
                        description="Filter words by learning priority",
                        type="select",
                        default_value="all",
                        options={
                            "all": "All words",
                            "0": "Priority 0 (essential)",
                            "1": "Priority 1 (important)",
                            "2": "Priority 2 (useful)",
                            "3+": "Priority 3+ (advanced)"
                        }
                    ),
                    SettingDefinition(
                        key="learning_order",
                        name="Learning order",
                        description="Show words in recommended learning order",
                        type="checkbox",
                        default_value=True
                    )
                ]
            )
        ]
    
    def process_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "priority_filter": settings.get("priority_filter", "all"),
            "learning_order": bool(settings.get("learning_order", True))
        }
    
    def get_default_settings(self) -> Dict[str, Any]:
        return {
            "priority_filter": "all",
            "learning_order": True
        }


class SettingsRegistry:
    """Central registry for managing all settings plugins"""
    
    def __init__(self):
        self.plugins: Dict[str, SettingsPlugin] = {}
        self._register_core_plugins()
    
    def _register_core_plugins(self):
        """Register the core settings plugins"""
        self.register_plugin("core", CoreSettingsPlugin())
        self.register_plugin("furigana", FuriganaSettingsPlugin())
        self.register_plugin("conjugation_verb", ConjugationSettingsPlugin("verb"))
        self.register_plugin("conjugation_adjective", ConjugationSettingsPlugin("adjective"))
        self.register_plugin("vocabulary", VocabularySettingsPlugin())
    
    def register_plugin(self, name: str, plugin: SettingsPlugin):
        """Register a new settings plugin"""
        self.plugins[name] = plugin
    
    def get_settings_groups(self, enabled_plugins: List[str]) -> List[SettingsGroup]:
        """Get all settings groups from enabled plugins"""
        groups = []
        for plugin_name in enabled_plugins:
            if plugin_name in self.plugins:
                groups.extend(self.plugins[plugin_name].get_settings_groups())
        return groups
    
    def get_default_settings(self, enabled_plugins: List[str]) -> Dict[str, Any]:
        """Get default settings from enabled plugins"""
        settings = {}
        for plugin_name in enabled_plugins:
            if plugin_name in self.plugins:
                plugin_settings = self.plugins[plugin_name].get_default_settings()
                settings.update(plugin_settings)
        return settings
    
    def process_settings(self, enabled_plugins: List[str], form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process form data through all enabled plugins"""
        settings = {}
        for plugin_name in enabled_plugins:
            if plugin_name in self.plugins:
                plugin_settings = self.plugins[plugin_name].process_settings(form_data)
                settings.update(plugin_settings)
        return settings


# Global settings registry instance
settings_registry = SettingsRegistry()


def get_module_settings_config(module_name: str) -> List[str]:
    """Get the list of enabled plugins for a specific module"""
    configs = {
        "hiragana": ["core"],
        "katakana": ["core"],
        "verbs": ["core", "furigana", "conjugation_verb"],
        "adjectives": ["core", "furigana", "conjugation_adjective"],
        "vocab": ["core", "furigana", "vocabulary"],
        "numbers_basic": ["core", "furigana", "vocabulary"],
        "numbers_extended": ["core", "furigana", "vocabulary"],
        "days_of_week": ["core", "furigana", "vocabulary"],
        "months_complete": ["core", "furigana", "vocabulary"],
        "colors_basic": ["core", "furigana", "vocabulary"],
        "greetings_essential": ["core", "furigana", "vocabulary"],
        "question_words": ["core", "furigana", "vocabulary"]
    }
    return configs.get(module_name, ["core"])


def get_user_settings(module_name: str) -> Dict[str, Any]:
    """Get user settings for a module with defaults"""
    enabled_plugins = get_module_settings_config(module_name)
    default_settings = settings_registry.get_default_settings(enabled_plugins)
    user_settings = session.get("settings", default_settings)
    
    # Ensure all default settings exist in user settings
    for key, value in default_settings.items():
        if key not in user_settings:
            user_settings[key] = value
    
    return user_settings


def update_user_settings(module_name: str, form_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update user settings from form data"""
    enabled_plugins = get_module_settings_config(module_name)
    processed_settings = settings_registry.process_settings(enabled_plugins, form_data)
    session["settings"] = processed_settings
    return processed_settings
