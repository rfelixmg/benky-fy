"""Conjugation settings plugin."""

from typing import Dict, List, Any, Optional
from ..models.definitions import SettingsPlugin, SettingsGroup, SettingDefinition


class ConjugationSettingsPlugin(SettingsPlugin):
    """Conjugation practice settings"""
    
    def get_settings_groups(self, module_config=None) -> List[SettingsGroup]:
        return [
            SettingsGroup(
                name="Conjugation Practice",
                description="Control conjugation practice settings",
                settings=[
                    SettingDefinition(
                        key="conjugation_mode",
                        name="Enable conjugation mode",
                        description="Practice conjugations instead of translations",
                        type="checkbox",
                        default_value=False
                    ),
                    SettingDefinition(
                        key="conjugation_forms",
                        name="Conjugation forms",
                        description="Which forms to practice",
                        type="checkbox",
                        default_value=["dictionary", "polite"]
                    )
                ]
            )
        ]
    
    def process_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "conjugation_mode": settings.get("conjugation_mode", False),
            "conjugation_forms": settings.get("conjugation_forms", ["dictionary", "polite"])
        }
    
    def get_default_settings(self) -> Dict[str, Any]:
        return {
            "conjugation_mode": False,
            "conjugation_forms": ["dictionary", "polite"]
        }
