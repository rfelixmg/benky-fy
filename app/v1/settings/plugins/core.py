"""Core flashcard settings plugin."""

from typing import Dict, List, Any
from ..models.definitions import SettingsPlugin, SettingsGroup, SettingDefinition


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
