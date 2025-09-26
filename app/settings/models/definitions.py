"""Settings data model definitions."""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable
from abc import ABC, abstractmethod


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
