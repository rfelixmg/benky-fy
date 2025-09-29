"""Furigana settings plugin."""

from typing import Dict, List, Any, Optional
from ..models.definitions import SettingsPlugin, SettingsGroup, SettingDefinition


class FuriganaSettingsPlugin(SettingsPlugin):
    """Furigana display settings"""
    
    def get_settings_groups(self, module_config=None) -> List[SettingsGroup]:
        return [
            SettingsGroup(
                name="Furigana Display",
                description="Control how furigana (reading aids) are displayed",
                settings=[
                    SettingDefinition(
                        key="furigana_style",
                        name="Furigana style",
                        description="How to display furigana",
                        type="radio",
                        default_value="ruby",
                        options={
                            "ruby": "Ruby tags (default browser)",
                            "hover": "Hover tooltips",
                            "inline": "Inline text",
                            "brackets": "Bracket notation"
                        }
                    )
                ]
            )
        ]
    
    def process_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "furigana_style": settings.get("furigana_style", "ruby")
        }
    
    def get_default_settings(self) -> Dict[str, Any]:
        return {
            "furigana_style": "ruby"
        }
