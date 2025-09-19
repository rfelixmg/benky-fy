"""Data loading utilities for the sentence generation system."""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional

class DataLoader:
    """Handles loading of vocabulary, rules, and other data files."""
    
    def __init__(self, data_dir: str = "tmp"):
        self.data_dir = Path(data_dir)
    
    def load_vocab(self) -> List[Dict[str, Any]]:
        """Load vocabulary data"""
        vocab_path = self.data_dir / "vocab.json"
        if not vocab_path.exists():
            raise FileNotFoundError(f"Vocabulary file not found: {vocab_path}")
        
        with open(vocab_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_verbs(self) -> List[Dict[str, Any]]:
        """Load verbs data"""
        verbs_path = self.data_dir / "verbs.json"
        if not verbs_path.exists():
            raise FileNotFoundError(f"Verbs file not found: {verbs_path}")
        
        with open(verbs_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_adjectives(self) -> List[Dict[str, Any]]:
        """Load adjectives data"""
        adjectives_path = self.data_dir / "adjectives.json"
        if not adjectives_path.exists():
            raise FileNotFoundError(f"Adjectives file not found: {adjectives_path}")
        
        with open(adjectives_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_rules(self) -> Dict[str, Any]:
        """Load sentence structure rules"""
        rules_path = self.data_dir / "rules.json"
        if not rules_path.exists():
            raise FileNotFoundError(f"Rules file not found: {rules_path}")
        
        with open(rules_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_modifiers(self) -> Dict[str, Any]:
        """Load modifiers data"""
        modifiers_path = self.data_dir / "modifiers.json"
        if not modifiers_path.exists():
            raise FileNotFoundError(f"Modifiers file not found: {modifiers_path}")
        
        with open(modifiers_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_all_data(self) -> Dict[str, Any]:
        """Load all data files"""
        return {
            "vocab": self.load_vocab(),
            "verbs": self.load_verbs(),
            "adjectives": self.load_adjectives(),
            "rules": self.load_rules(),
            "modifiers": self.load_modifiers()
        }
