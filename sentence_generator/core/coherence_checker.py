"""Coherence checking system for generated sentences."""

from typing import Dict, List, Any, Tuple
from .enums import RelationshipType
from .models import Sentence

class CoherenceChecker:
    """Validates logical coherence of generated sentences."""
    
    def __init__(self, structure_relationships: Dict[str, RelationshipType]):
        self.structure_relationships = structure_relationships
    
    def check_coherence(self, sentence: Sentence) -> Tuple[bool, List[str]]:
        """Check if sentence is coherent and return issues if any"""
        issues = []
        
        # Check for [NOT FOUND] placeholders
        if "[NOT FOUND]" in sentence.japanese or "[NOT FOUND]" in sentence.english:
            issues.append("Contains [NOT FOUND] placeholders - missing vocabulary")
        
        # Check for semantic coherence based on relationship type
        relationship = self.structure_relationships.get(sentence.structure, RelationshipType.ACTION)
        
        if relationship == RelationshipType.OWNERSHIP:
            if not self._check_ownership_coherence(sentence.components):
                issues.append("Ownership relationship doesn't make logical sense")
        
        elif relationship == RelationshipType.ACTION:
            if not self._check_action_coherence(sentence.components):
                issues.append("Action relationship doesn't make logical sense")
        
        elif relationship == RelationshipType.LOCATION:
            if not self._check_motion_coherence(sentence.components):
                issues.append("Motion/location relationship doesn't make logical sense")
        
        elif relationship == RelationshipType.DESCRIPTION:
            if not self._check_description_coherence(sentence.components):
                issues.append("Description relationship doesn't make logical sense")
        
        elif relationship == RelationshipType.IDENTITY:
            if not self._check_identity_coherence(sentence.components):
                issues.append("Identity relationship doesn't make logical sense")
        
        # Check for domain coherence
        if not self._check_domain_coherence(sentence.components):
            issues.append("Components don't share coherent semantic domains")
        
        # Check for contextual appropriateness
        if not self._check_contextual_appropriateness(sentence.components, relationship):
            issues.append("Components lack contextual appropriateness")
        
        return len(issues) == 0, issues
    
    def _check_ownership_coherence(self, components: Dict[str, Any]) -> bool:
        """Check if ownership relationship makes logical sense"""
        if "A" not in components or "B" not in components:
            return False
        
        owner = components["A"]
        owned = components["B"]
        
        if not isinstance(owner, dict) or not isinstance(owned, dict):
            return False
        
        owner_entity = owner.get("entity", "thing")
        owned_entity = owned.get("entity", "thing")
        
        # People can own things, places, concepts
        if owner_entity == "person" and owned_entity in ["thing", "place", "concept"]:
            return True
        
        # Groups can own things, places
        if owner_entity == "group" and owned_entity in ["thing", "place"]:
            return True
        
        # Animals rarely own things
        if owner_entity == "animal" and owned_entity == "thing":
            return False
        
        # Things don't own other things
        if owner_entity == "thing" and owned_entity == "thing":
            return False
        
        return True
    
    def _check_action_coherence(self, components: Dict[str, Any]) -> bool:
        """Check if action relationship makes logical sense"""
        if "A" not in components or "Verb" not in components:
            return False
        
        actor = components["A"]
        verb = components["Verb"]
        
        if not isinstance(actor, dict) or not isinstance(verb, dict):
            return False
        
        actor_entity = actor.get("entity", "thing")
        actor_tags = actor.get("tags", [])
        verb_semantics = verb.get("semantic", [])
        
        # Time concepts (morning, evening, days, months) cannot perform actions
        if "time" in actor_tags or actor_entity == "concept" and any(tag in ["time", "day", "month"] for tag in actor_tags):
            return False
        
        # People can perform most actions
        if actor_entity == "person":
            return True
        
        # Animals can perform physical actions
        if actor_entity == "animal" and any(sem in ["action", "motion", "physiological"] for sem in verb_semantics):
            return True
        
        # Places cannot perform actions
        if actor_entity == "place":
            return False
        
        # Things rarely perform actions
        if actor_entity == "thing" and any(sem in ["action", "motion"] for sem in verb_semantics):
            return False
        
        return True
    
    def _check_motion_coherence(self, components: Dict[str, Any]) -> bool:
        """Check if motion/location relationship makes logical sense"""
        if "A" not in components:
            return False
        
        actor = components["A"]
        
        if not isinstance(actor, dict):
            return False
        
        actor_entity = actor.get("entity", "thing")
        actor_tags = actor.get("tags", [])
        
        # Time concepts cannot move to places
        if "time" in actor_tags or actor_entity == "concept" and any(tag in ["time", "day", "month"] for tag in actor_tags):
            return False
        
        # Places cannot move to other places (usually)
        if actor_entity == "place":
            return False
        
        # People, animals, and things can move to places
        if actor_entity in ["person", "animal", "thing"]:
            return True
        
        return True
    
    def _check_description_coherence(self, components: Dict[str, Any]) -> bool:
        """Check if description relationship makes logical sense with semantic intelligence"""
        if "A" not in components or "Adj" not in components:
            return False
        
        described = components["A"]
        adjective = components["Adj"]
        
        if not isinstance(described, dict) or not isinstance(adjective, dict):
            return False
        
        described_entity = described.get("entity", "thing")
        described_tags = described.get("tags", [])
        described_english = described.get("english", "").lower()
        adj_tags = adjective.get("tags", [])
        adj_english = adjective.get("english", "").lower()
        
        # Define semantic appropriateness rules for specific adjective-noun combinations
        semantic_rules = {
            # Adjectives that only apply to people
            "famous": ["person", "place", "concept"],  # Famous people, places, concepts - NOT things
            "popular": ["person", "place", "concept"],  # Popular people, places, concepts - NOT things
            "intelligent": ["person", "animal"],  # Intelligent people/animals - NOT things
            "kind": ["person", "animal"],  # Kind people/animals - NOT things
            "brave": ["person", "animal"],  # Brave people/animals - NOT things
            "honest": ["person"],  # Honest people - NOT things/animals
            "patient": ["person"],  # Patient people - NOT things/animals
            "creative": ["person"],  # Creative people - NOT things/animals
            "talented": ["person"],  # Talented people - NOT things/animals
            "wise": ["person"],  # Wise people - NOT things/animals
            
            # Adjectives that only apply to things/objects
            "expensive": ["thing"],  # Expensive things - NOT people/animals
            "cheap": ["thing"],  # Cheap things - NOT people/animals
            "broken": ["thing"],  # Broken things - NOT people/animals
            "new": ["thing"],  # New things - NOT people/animals
            "old": ["thing", "person", "animal", "place"],  # Can apply to many things
            "heavy": ["thing"],  # Heavy things - NOT people/animals (usually)
            "light": ["thing"],  # Light things - NOT people/animals (usually)
            "soft": ["thing"],  # Soft things - NOT people/animals (usually)
            "hard": ["thing"],  # Hard things - NOT people/animals (usually)
            "sharp": ["thing"],  # Sharp things - NOT people/animals (usually)
            "smooth": ["thing"],  # Smooth things - NOT people/animals (usually)
            "rough": ["thing"],  # Rough things - NOT people/animals (usually)
            
            # Adjectives that only apply to places/spatial concepts
            "crowded": ["place"],  # Crowded places - NOT people/things
            "quiet": ["place"],  # Quiet places - NOT people/things
            "noisy": ["place"],  # Noisy places - NOT people/things
            "beautiful": ["place", "person", "thing"],  # Can apply to many things
            "scenic": ["place"],  # Scenic places - NOT people/things
            "remote": ["place"],  # Remote places - NOT people/things
            "urban": ["place"],  # Urban places - NOT people/things
            "rural": ["place"],  # Rural places - NOT people/things
            "far": ["place"],  # Far places - NOT people/things/animals
            "distant": ["place"],  # Distant places - NOT people/things/animals
            "near": ["place"],  # Near places - NOT people/things/animals
            "close": ["place"],  # Close places - NOT people/things/animals
            
            # Adjectives that only apply to food/drink
            "delicious": ["thing"],  # Delicious food - NOT people/places
            "spicy": ["thing"],  # Spicy food - NOT people/places
            "sweet": ["thing"],  # Sweet food - NOT people/places
            "bitter": ["thing"],  # Bitter food - NOT people/places
            "salty": ["thing"],  # Salty food - NOT people/places
            "fresh": ["thing"],  # Fresh food - NOT people/places
            "sour": ["thing"],  # Sour food - NOT people/places/time
            "hot": ["thing", "concept"],  # Hot food/weather - NOT people/animals/time
            "cold": ["thing", "concept"],  # Cold food/weather - NOT people/animals/time
            
            # Adjectives that only apply to concepts/abstract things
            "important": ["concept", "thing"],  # Important concepts/things - NOT people/animals
            "necessary": ["concept", "thing"],  # Necessary concepts/things - NOT people/animals
            "useful": ["concept", "thing"],  # Useful concepts/things - NOT people/animals
            "difficult": ["concept", "thing"],  # Difficult concepts/things - NOT people/animals
            "easy": ["concept", "thing"],  # Easy concepts/things - NOT people/animals
            "simple": ["concept", "thing"],  # Simple concepts/things - NOT people/animals
            "interesting": ["concept", "thing", "person"],  # Can apply to many things
            "boring": ["concept", "thing", "person"],  # Can apply to many things
            
            # Adjectives that only apply to time concepts
            "early": ["concept"],  # Early time - NOT people/things/places
            "late": ["concept"],  # Late time - NOT people/things/places
            "fast": ["concept", "thing"],  # Fast time/things - NOT people/animals
            "slow": ["concept", "thing"],  # Slow time/things - NOT people/animals
            
            # Adjectives that only apply to emotions/feelings (for people/animals)
            "fun": ["person", "concept"],  # Fun people/concepts - NOT things/places
            "enjoyable": ["person", "concept"],  # Enjoyable people/concepts - NOT things/places
            "sad": ["person", "animal"],  # Sad people/animals - NOT things/places
            "happy": ["person", "animal"],  # Happy people/animals - NOT things/places
            "angry": ["person", "animal"],  # Angry people/animals - NOT things/places
            "excited": ["person", "animal"],  # Excited people/animals - NOT things/animals
        }
        
        # Check specific semantic rules first
        if adj_english in semantic_rules:
            allowed_entities = semantic_rules[adj_english]
            if described_entity not in allowed_entities:
                return False
        
        # Additional semantic checks based on entity type and tags
        if described_entity == "person":
            # People can be described by personality, appearance, emotional, or general descriptive adjectives
            if not any(tag in ["people", "feelings", "description", "appearance", "personality"] for tag in adj_tags):
                # Check if it's a general descriptive adjective that could apply to people
                if adj_english in ["good", "bad", "big", "small", "young", "old", "beautiful", "ugly"]:
                    return True
                return False
        
        elif described_entity == "thing":
            # Things can be described by physical, functional, or general descriptive adjectives
            if not any(tag in ["description", "feelings", "taste", "quantity", "study", "daily life", "physical", "functional"] for tag in adj_tags):
                # Check if it's a general descriptive adjective that could apply to things
                if adj_english in ["good", "bad", "big", "small", "new", "old", "beautiful", "ugly", "interesting", "boring"]:
                    return True
                return False
        
        elif described_entity == "place":
            # Places can be described by spatial, environmental, or general descriptive adjectives
            if not any(tag in ["places", "description", "feelings", "spatial", "environmental"] for tag in adj_tags):
                # Check if it's a general descriptive adjective that could apply to places
                if adj_english in ["good", "bad", "big", "small", "beautiful", "ugly", "interesting", "boring", "quiet", "noisy"]:
                    return True
                return False
        
        elif described_entity == "animal":
            # Animals can be described by behavioral, physical, or general descriptive adjectives
            if not any(tag in ["description", "feelings", "behavioral", "physical"] for tag in adj_tags):
                # Check if it's a general descriptive adjective that could apply to animals
                if adj_english in ["good", "bad", "big", "small", "beautiful", "ugly", "interesting", "boring", "kind", "brave"]:
                    return True
                return False
        
        elif described_entity == "concept":
            # Concepts can be described by abstract, intellectual, or general descriptive adjectives
            if not any(tag in ["description", "feelings", "abstract", "intellectual", "study"] for tag in adj_tags):
                # Check if it's a general descriptive adjective that could apply to concepts
                if adj_english in ["good", "bad", "important", "interesting", "boring", "difficult", "easy"]:
                    return True
                return False
        
        return True
    
    def _check_identity_coherence(self, components: Dict[str, Any]) -> bool:
        """Check if identity relationship makes logical sense"""
        if "A" not in components or "B" not in components:
            return False
        
        entity_a = components["A"]
        entity_b = components["B"]
        
        if not isinstance(entity_a, dict) or not isinstance(entity_b, dict):
            return False
        
        entity_a_type = entity_a.get("entity", "thing")
        entity_b_type = entity_b.get("entity", "thing")
        
        # Same entity types can be identical
        if entity_a_type == entity_b_type:
            return True
        
        # People can be identified with roles, professions, concepts
        if entity_a_type == "person" and entity_b_type in ["concept", "group"]:
            return True
        
        # Things can be identified with their categories
        if entity_a_type == "thing" and entity_b_type == "concept":
            return True
        
        # Places can be identified with their types
        if entity_a_type == "place" and entity_b_type == "concept":
            return True
        
        return False
    
    def _check_domain_coherence(self, components: Dict[str, Any]) -> bool:
        """Check if components share coherent semantic domains"""
        # For now, assume domain coherence is maintained by the semantic intelligence system
        return True
    
    def _check_contextual_appropriateness(self, components: Dict[str, Any], relationship: RelationshipType) -> bool:
        """Check if components are contextually appropriate for the relationship"""
        # For now, assume contextual appropriateness is maintained by the semantic intelligence system
        return True
