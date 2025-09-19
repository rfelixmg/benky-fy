"""Core enums for the sentence generation system."""

from enum import Enum

class RelationshipType(Enum):
    """Types of relationships between entities"""
    OWNERSHIP = "ownership"  # A owns B
    ASSOCIATION = "association"  # A is related to B
    ACTION = "action"  # A performs action on B
    DESCRIPTION = "description"  # A describes B
    LOCATION = "location"  # A is at/from B
    IDENTITY = "identity"  # A is B
    ATTRIBUTION = "attribution"  # A has property B

class SemanticDomain(Enum):
    """Semantic domains for contextual appropriateness"""
    DAILY_LIFE = "daily_life"
    ACADEMIC = "academic"
    PROFESSIONAL = "professional"
    SOCIAL = "social"
    PHYSICAL = "physical"
    EMOTIONAL = "emotional"
    TEMPORAL = "temporal"
    SPATIAL = "spatial"
    ABSTRACT = "abstract"
