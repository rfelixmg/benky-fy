"""Semantic intelligence system for sentence generation."""

import random
from typing import Dict, List, Any, Optional, Tuple
from .enums import RelationshipType, SemanticDomain
from .models import CompatibilityScore

class SemanticIntelligence:
    """Handles semantic compatibility and contextual appropriateness."""
    
    def __init__(self):
        self.entity_domains = {}
        self.structure_relationships = {}
        self.semantic_compatibility = {}
        self.contextual_rules = {}
        self._init_semantic_mappings()
    
    def _init_semantic_mappings(self):
        """Initialize semantic compatibility mappings and domain classifications"""
        # Define semantic domain mappings for different entity types and concepts
        self.entity_domains = {
            "person": [SemanticDomain.DAILY_LIFE, SemanticDomain.SOCIAL, SemanticDomain.PROFESSIONAL],
            "animal": [SemanticDomain.DAILY_LIFE, SemanticDomain.PHYSICAL],
            "thing": [SemanticDomain.DAILY_LIFE, SemanticDomain.PHYSICAL, SemanticDomain.ABSTRACT],
            "place": [SemanticDomain.SPATIAL, SemanticDomain.DAILY_LIFE],
            "concept": [SemanticDomain.ABSTRACT, SemanticDomain.ACADEMIC],
            "group": [SemanticDomain.SOCIAL, SemanticDomain.PROFESSIONAL],
            "event": [SemanticDomain.TEMPORAL, SemanticDomain.SOCIAL],
            "phenomenon": [SemanticDomain.ABSTRACT, SemanticDomain.PHYSICAL]
        }
        
        # Define relationship type mappings for different sentence structures
        self.structure_relationships = {
            "A は B です": RelationshipType.IDENTITY,
            "A を Verb": RelationshipType.ACTION,
            "A で Verb": RelationshipType.LOCATION,
            "A へ/に Verb": RelationshipType.LOCATION,
            "A は Place に Verb": RelationshipType.LOCATION,
            "A の B": RelationshipType.OWNERSHIP,
            "A は Adj です": RelationshipType.DESCRIPTION,
            "Adj + Noun": RelationshipType.ATTRIBUTION,
            "A が Verb": RelationshipType.ACTION,
            "A は B が Adj": RelationshipType.ATTRIBUTION
        }
        
        # Define semantic compatibility matrices
        self.semantic_compatibility = {
            # High compatibility (0.8-1.0)
            ("person", "person"): 0.9,
            ("person", "thing"): 0.8,
            ("person", "place"): 0.8,
            ("thing", "thing"): 0.9,
            ("place", "place"): 0.9,
            ("animal", "animal"): 0.9,
            ("animal", "thing"): 0.7,
            
            # Medium compatibility (0.5-0.7)
            ("person", "animal"): 0.6,
            ("person", "concept"): 0.6,
            ("thing", "place"): 0.6,
            ("concept", "concept"): 0.8,
            ("group", "person"): 0.7,
            ("group", "thing"): 0.6,
            
            # Low compatibility (0.0-0.4)
            ("person", "phenomenon"): 0.3,
            ("animal", "concept"): 0.2,
            ("thing", "phenomenon"): 0.4,
            ("place", "concept"): 0.3
        }
        
        # Define contextual appropriateness rules
        self.contextual_rules = {
            # Ownership relationships
            RelationshipType.OWNERSHIP: {
                "person": ["thing", "place", "concept"],  # People can own things, places, concepts
                "group": ["thing", "place"],  # Groups can own things, places
                "thing": []  # Things generally don't own other things
            },
            # Action relationships
            RelationshipType.ACTION: {
                "person": ["thing", "person", "animal"],  # People can act on things, people, animals
                "animal": ["thing"],  # Animals can act on things
                "thing": []  # Things generally don't perform actions
            },
            # Location relationships
            RelationshipType.LOCATION: {
                "person": ["place"],  # People can be at places
                "animal": ["place"],  # Animals can be at places
                "thing": ["place"],  # Things can be at places
                "group": ["place"]  # Groups can be at places
            },
            # Description relationships
            RelationshipType.DESCRIPTION: {
                "person": ["thing", "concept"],  # People can be described by things/concepts
                "thing": ["thing", "concept"],  # Things can be described by things/concepts
                "place": ["thing", "concept"],  # Places can be described by things/concepts
                "animal": ["thing", "concept"]  # Animals can be described by things/concepts
            }
        }
    
    def calculate_semantic_compatibility(self, entity1: str, entity2: str) -> float:
        """Calculate semantic compatibility between two entity types"""
        # Direct lookup
        key1 = (entity1, entity2)
        key2 = (entity2, entity1)
        
        if key1 in self.semantic_compatibility:
            return self.semantic_compatibility[key1]
        elif key2 in self.semantic_compatibility:
            return self.semantic_compatibility[key2]
        
        # Default compatibility based on domain overlap
        domains1 = set(self.entity_domains.get(entity1, []))
        domains2 = set(self.entity_domains.get(entity2, []))
        
        if not domains1 or not domains2:
            return 0.3  # Low default compatibility
        
        overlap = len(domains1.intersection(domains2))
        total = len(domains1.union(domains2))
        
        return overlap / total if total > 0 else 0.3
    
    def calculate_contextual_appropriateness(self, entity_type: str, relationship: RelationshipType) -> float:
        """Calculate contextual appropriateness for entity-relationship pairs"""
        if relationship not in self.contextual_rules:
            return 0.5  # Neutral appropriateness
        
        allowed_targets = self.contextual_rules[relationship].get(entity_type, [])
        
        if not allowed_targets:
            return 0.2  # Low appropriateness - entity can't participate in this relationship
        
        return 0.8  # High appropriateness - entity can participate in this relationship
    
    def calculate_relationship_fit(self, entity1: str, entity2: str, relationship: RelationshipType) -> float:
        """Calculate how well two entities fit in a specific relationship"""
        if relationship == RelationshipType.OWNERSHIP:
            # Ownership: person/group -> thing/place/concept
            if entity1 in ["person", "group"] and entity2 in ["thing", "place", "concept"]:
                return 0.9
            elif entity1 == "person" and entity2 == "person":
                return 0.7  # People can own things belonging to other people
            else:
                return 0.2
        
        elif relationship == RelationshipType.ACTION:
            # Action: person/animal -> thing/person/animal
            if entity1 in ["person", "animal"] and entity2 in ["thing", "person", "animal"]:
                return 0.9
            elif entity1 == "person" and entity2 == "concept":
                return 0.6  # People can act on concepts (learn, understand)
            else:
                return 0.2
        
        elif relationship == RelationshipType.LOCATION:
            # Location: person/animal/thing -> place
            if entity1 in ["person", "animal", "thing"] and entity2 == "place":
                return 0.9
            else:
                return 0.2
        
        elif relationship == RelationshipType.DESCRIPTION:
            # Description: any entity can be described
            return 0.8
        
        elif relationship == RelationshipType.IDENTITY:
            # Identity: entities of same type or compatible types
            if entity1 == entity2:
                return 0.9
            elif self.calculate_semantic_compatibility(entity1, entity2) > 0.6:
                return 0.7
            else:
                return 0.3
        
        elif relationship == RelationshipType.ATTRIBUTION:
            # Attribution: any entity can have attributes
            return 0.8
        
        else:
            return 0.5  # Neutral fit for unknown relationships
    
    def get_compatibility_score(self, entity1: str, entity2: str, relationship: RelationshipType) -> CompatibilityScore:
        """Get overall compatibility score for entity pair in relationship"""
        semantic_match = self.calculate_semantic_compatibility(entity1, entity2)
        contextual_appropriateness = self.calculate_contextual_appropriateness(entity1, relationship)
        relationship_fit = self.calculate_relationship_fit(entity1, entity2, relationship)
        
        return CompatibilityScore(
            semantic_match=semantic_match,
            contextual_appropriateness=contextual_appropriateness,
            relationship_fit=relationship_fit,
            overall=0.0  # Will be calculated in __post_init__
        )
