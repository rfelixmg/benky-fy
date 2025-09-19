"""Data models for the sentence generation system."""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional

@dataclass
class CompatibilityScore:
    """Score for semantic compatibility"""
    semantic_match: float  # 0.0 to 1.0
    contextual_appropriateness: float  # 0.0 to 1.0
    relationship_fit: float  # 0.0 to 1.0
    overall: float  # Combined score
    
    def __post_init__(self):
        # Weighted combination: semantic (40%), context (35%), relationship (25%)
        self.overall = (
            self.semantic_match * 0.4 + 
            self.contextual_appropriateness * 0.35 + 
            self.relationship_fit * 0.25
        )

@dataclass
class Sentence:
    """Final output sentence dataclass"""
    japanese: str
    english: str
    structure: str
    theme: str
    components: Dict[str, Any]
    coherence_passed: bool
    coherence_issues: List[str]
    debug_info: Optional[Dict[str, Any]] = None
