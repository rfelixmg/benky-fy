"""Vocabulary settings plugin."""

from typing import Dict, List, Any
from ..models.definitions import SettingsPlugin, SettingsGroup, SettingDefinition


class VocabularySettingsPlugin(SettingsPlugin):
    """Vocabulary learning settings"""
    
    def get_settings_groups(self) -> List[SettingsGroup]:
        return [
            SettingsGroup(
                name="Vocabulary Learning",
                description="Control vocabulary learning settings",
                settings=[
                    SettingDefinition(
                        key="priority_filter",
                        name="Priority filter",
                        description="Filter by learning priority",
                        type="select",
                        default_value="all",
                        options={
                            "all": "All priorities",
                            "1": "Priority 1 (essential)",
                            "2": "Priority 2 (important)",
                            "3": "Priority 3 (useful)"
                        }
                    ),
                    SettingDefinition(
                        key="learning_order",
                        name="Learning order",
                        description="Follow recommended learning order",
                        type="checkbox",
                        default_value=True
                    )
                ]
            )
        ]
    
    def process_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "priority_filter": settings.get("priority_filter", "all"),
            "learning_order": settings.get("learning_order", True)
        }
    
    def get_default_settings(self) -> Dict[str, Any]:
        return {
            "priority_filter": "all",
            "learning_order": True
        }
