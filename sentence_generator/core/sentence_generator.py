"""Main sentence generation system."""

import random
from typing import Dict, List, Any, Optional, Tuple
from .enums import RelationshipType
from .models import Sentence, CompatibilityScore
from .semantic_intelligence import SemanticIntelligence
from .coherence_checker import CoherenceChecker
from ..data.loader import DataLoader

class SentenceGenerator:
    """Main sentence generation system with semantic intelligence."""
    
    def __init__(self, data_dir: str = "tmp"):
        self.data_loader = DataLoader(data_dir)
        self.semantic_intelligence = SemanticIntelligence()
        self.coherence_checker = CoherenceChecker(self.semantic_intelligence.structure_relationships)
        
        # Load data
        self.data = self.data_loader.load_all_data()
        self.vocab = self.data["vocab"]
        self.verbs = self.data["verbs"]
        self.adjectives = self.data["adjectives"]
        self.rules = self.data["rules"]
        self.modifiers = self.data["modifiers"]
    
    def generate_sentence(self, theme: Optional[str] = None, debug: bool = False) -> Sentence:
        """Generate a single sentence with semantic intelligence"""
        # Select theme and structure
        if theme and theme in self.rules:
            selected_theme = theme
        else:
            selected_theme = random.choice(list(self.rules.keys()))
        
        theme_data = self.rules[selected_theme]
        structure = theme_data["structure"]
        
        # Get relationship type for semantic intelligence
        relationship = self.semantic_intelligence.structure_relationships.get(structure, RelationshipType.ACTION)
        
        # Generate components using semantic intelligence
        components = self._generate_components(theme_data, relationship, debug)
        
        # Build sentence
        japanese, english = self._build_sentence(structure, components, theme_data)
        
        # Check coherence
        sentence = Sentence(
            japanese=japanese,
            english=english,
            structure=structure,
            theme=selected_theme,
            components=components,
            coherence_passed=False,
            coherence_issues=[]
        )
        
        coherence_passed, coherence_issues = self.coherence_checker.check_coherence(sentence)
        sentence.coherence_passed = coherence_passed
        sentence.coherence_issues = coherence_issues
        
        if debug:
            sentence.debug_info = {
                "relationship": relationship.value,
                "semantic_scores": self._get_debug_scores(components, relationship)
            }
        
        return sentence
    
    def _generate_components(self, theme_data: Dict[str, Any], relationship: RelationshipType, debug: bool) -> Dict[str, Any]:
        """Generate sentence components using semantic intelligence"""
        components = {}
        slots = theme_data.get("slots", {})
        
        for slot_name, slot_config in slots.items():
            if slot_name == "Adj":
                # Special handling for adjectives
                component = self._pick_adjective_sample()
            elif isinstance(slot_config, list):
                # Entity type matching
                component = self._smart_entity_selection(slot_config, relationship, debug)
            elif isinstance(slot_config, dict) and "depends_on" in slot_config:
                # Dependent selection
                dependency = slot_config["depends_on"]
                if dependency in components:
                    component = self._get_dependent_component(slot_config, components[dependency], relationship)
                else:
                    component = None
            else:
                component = None
            
            if component is None:
                component = {"english": "[NOT FOUND]", "hiragana": "[NOT FOUND]", "entity": "thing"}
            
            components[slot_name] = component
        
        return components
    
    def _smart_entity_selection(self, entity_types: List[str], relationship: RelationshipType, debug: bool) -> Optional[Dict[str, Any]]:
        """Select entity using semantic intelligence"""
        candidates = []
        
        for entity_type in entity_types:
            for item in self.vocab:
                if item.get("entity") == entity_type:
                    candidates.append(item)
        
        if not candidates:
            return None
        
        # Use semantic intelligence to score candidates
        scored_candidates = []
        for candidate in candidates:
            score = self.semantic_intelligence.get_compatibility_score(
                candidate.get("entity", "thing"),
                "thing",  # Default target
                relationship
            )
            scored_candidates.append((candidate, score.overall))
        
        # Weighted random selection
        if scored_candidates:
            candidates, scores = zip(*scored_candidates)
            total_score = sum(scores)
            probabilities = [score / total_score for score in scores]
            return random.choices(candidates, weights=probabilities)[0]
        
        return random.choice(candidates) if candidates else None
    
    def _get_dependent_component(self, slot_config: Dict[str, Any], dependency: Dict[str, Any], relationship: RelationshipType) -> Optional[Dict[str, Any]]:
        """Get component that depends on another component"""
        options = slot_config.get("options", "")
        
        if "compatible_verbs" in options:
            return self.get_compatible_verb(dependency.get("entity", "thing"), relationship)
        elif "compatible_adjectives" in options:
            return self.get_compatible_adjective(dependency.get("entity", "thing"), relationship)
        
        return None
    
    def get_compatible_verb(self, entity_type: str, relationship: RelationshipType = None) -> Optional[Dict[str, Any]]:
        """Get a verb compatible with the entity type using semantic intelligence"""
        if relationship is None:
            relationship = RelationshipType.ACTION
        
        # Get smart compatibility scores
        compatible_verbs = self.get_smart_verb_compatibility(entity_type, relationship)
        
        if not compatible_verbs:
            return None
        
        # Use weighted random selection based on compatibility scores
        verbs, scores = zip(*compatible_verbs)
        total_score = sum(scores)
        probabilities = [score / total_score for score in scores]
        
        return random.choices(verbs, weights=probabilities)[0]
    
    def get_compatible_adjective(self, entity_type: str, relationship: RelationshipType = None) -> Optional[Dict[str, Any]]:
        """Get an adjective compatible with the entity type using semantic intelligence"""
        if relationship is None:
            relationship = RelationshipType.DESCRIPTION
        
        # Get smart compatibility scores
        compatible_adjectives = self.get_smart_adjective_compatibility(entity_type, relationship)
        
        if not compatible_adjectives:
            return None
        
        # Use weighted random selection based on compatibility scores
        adjectives, scores = zip(*compatible_adjectives)
        total_score = sum(scores)
        probabilities = [score / total_score for score in scores]
        
        return random.choices(adjectives, weights=probabilities)[0]
    
    def get_smart_verb_compatibility(self, entity_type: str, relationship: RelationshipType) -> List[Tuple[Dict[str, Any], float]]:
        """Get verbs with compatibility scores for entity type and relationship"""
        compatible_verbs = []
        
        for verb in self.verbs:
            verb_semantics = verb.get("semantic", [])
            verb_tags = verb.get("tags", [])
            
            # Calculate compatibility score
            score = self.semantic_intelligence.get_compatibility_score(
                entity_type, "thing", relationship
            )
            
            # Adjust score based on verb semantics
            if relationship == RelationshipType.ACTION:
                if any(sem in ["action", "motion", "physiological"] for sem in verb_semantics):
                    score.overall *= 1.2  # Boost action verbs
                elif any(sem in ["state", "existence"] for sem in verb_semantics):
                    score.overall *= 0.8  # Reduce state verbs for actions
            
            if score.overall > 0.3:  # Minimum threshold
                compatible_verbs.append((verb, score.overall))
        
        return compatible_verbs
    
    def get_smart_adjective_compatibility(self, entity_type: str, relationship: RelationshipType) -> List[Tuple[Dict[str, Any], float]]:
        """Get adjectives with compatibility scores for entity type and relationship"""
        compatible_adjectives = []
        
        for adjective in self.adjectives:
            adj_tags = adjective.get("tags", [])
            
            # Calculate compatibility score
            score = self.semantic_intelligence.get_compatibility_score(
                entity_type, "thing", relationship
            )
            
            # Adjust score based on adjective tags
            if relationship == RelationshipType.DESCRIPTION:
                if any(tag in ["description", "appearance", "personality"] for tag in adj_tags):
                    score.overall *= 1.2  # Boost descriptive adjectives
                elif any(tag in ["feelings", "emotions"] for tag in adj_tags):
                    score.overall *= 0.9  # Slightly reduce emotional adjectives
            
            if score.overall > 0.3:  # Minimum threshold
                compatible_adjectives.append((adjective, score.overall))
        
        return compatible_adjectives
    
    def _pick_adjective_sample(self) -> Optional[Dict[str, Any]]:
        """Pick a random adjective from the adjectives list"""
        if not self.adjectives:
            return None
        return random.choice(self.adjectives)
    
    def _build_sentence(self, structure: str, components: Dict[str, Any], theme_data: Dict[str, Any]) -> Tuple[str, str]:
        """Build Japanese and English sentences from components"""
        japanese_parts = []
        english_parts = []
        
        # Handle different structures
        if structure == "A は B です":
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "は",
                components.get("B", {}).get("hiragana", "[NOT FOUND]"),
                "です"
            ]
            english_parts = [
                components.get("A", {}).get("english", "[NOT FOUND]"),
                "is",
                components.get("B", {}).get("english", "[NOT FOUND]")
            ]
        
        elif structure == "A を Verb":
            verb = components.get("Verb", {})
            verb_form = self.get_verb_conjugation(verb, "polite")
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "を",
                verb_form
            ]
            english_parts = [
                components.get("A", {}).get("english", "[NOT FOUND]"),
                verb.get("english", "[NOT FOUND]")
            ]
        
        elif structure == "A で Verb":
            verb = components.get("Verb", {})
            verb_form = self.get_verb_conjugation(verb, "polite")
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "で",
                verb_form
            ]
            english_parts = [
                verb.get("english", "[NOT FOUND]"),
                "at",
                components.get("A", {}).get("english", "[NOT FOUND]")
            ]
        
        elif structure == "A へ/に Verb":
            verb = components.get("Verb", {})
            verb_form = self.get_verb_conjugation(verb, "polite")
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "へ",
                verb_form
            ]
            english_parts = [
                verb.get("english", "[NOT FOUND]"),
                "to",
                components.get("A", {}).get("english", "[NOT FOUND]")
            ]
        
        elif structure == "A は Place に Verb":
            verb = components.get("Verb", {})
            verb_form = self.get_verb_conjugation(verb, "polite")
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "は",
                components.get("Place", {}).get("hiragana", "[NOT FOUND]"),
                "に",
                verb_form
            ]
            english_parts = [
                components.get("A", {}).get("english", "[NOT FOUND]"),
                verb.get("english", "[NOT FOUND]"),
                "to",
                components.get("Place", {}).get("english", "[NOT FOUND]")
            ]
        
        elif structure == "A の B":
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "の",
                components.get("B", {}).get("hiragana", "[NOT FOUND]")
            ]
            english_parts = [
                components.get("A", {}).get("english", "[NOT FOUND]"),
                "'s",
                components.get("B", {}).get("english", "[NOT FOUND]")
            ]
        
        elif structure == "A は Adj です":
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "は",
                components.get("Adj", {}).get("hiragana", "[NOT FOUND]"),
                "です"
            ]
            english_parts = [
                components.get("A", {}).get("english", "[NOT FOUND]"),
                "is",
                components.get("Adj", {}).get("english", "[NOT FOUND]")
            ]
        
        elif structure == "Adj + Noun":
            japanese_parts = [
                components.get("Adj", {}).get("hiragana", "[NOT FOUND]"),
                components.get("Noun", {}).get("hiragana", "[NOT FOUND]")
            ]
            english_parts = [
                components.get("Adj", {}).get("english", "[NOT FOUND]"),
                components.get("Noun", {}).get("english", "[NOT FOUND]")
            ]
        
        elif structure == "A が Verb":
            verb = components.get("Verb", {})
            verb_form = self.get_verb_conjugation(verb, "polite")
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "が",
                verb_form
            ]
            english_parts = [
                components.get("A", {}).get("english", "[NOT FOUND]"),
                verb.get("english", "[NOT FOUND]")
            ]
        
        elif structure == "A は B が Adj":
            japanese_parts = [
                components.get("A", {}).get("hiragana", "[NOT FOUND]"),
                "は",
                components.get("B", {}).get("hiragana", "[NOT FOUND]"),
                "が",
                components.get("Adj", {}).get("hiragana", "[NOT FOUND]"),
                "です"
            ]
            english_parts = [
                components.get("A", {}).get("english", "[NOT FOUND]"),
                "'s",
                components.get("B", {}).get("english", "[NOT FOUND]"),
                "is",
                components.get("Adj", {}).get("english", "[NOT FOUND]")
            ]
        
        else:
            # Default structure
            japanese_parts = ["[NOT FOUND]"]
            english_parts = ["[NOT FOUND]"]
        
        return " ".join(japanese_parts), " ".join(english_parts)
    
    def get_verb_conjugation(self, verb: Dict[str, Any], conjugation_type: str = "polite") -> str:
        """Get verb conjugation"""
        conjugations = verb.get("conjugations", {})
        if conjugation_type in conjugations:
            return conjugations[conjugation_type].get("hiragana", verb.get("hiragana", ""))
        return verb.get("hiragana", "")
    
    def _get_debug_scores(self, components: Dict[str, Any], relationship: RelationshipType) -> Dict[str, Any]:
        """Get debug information about semantic scores"""
        debug_scores = {}
        
        for slot_name, component in components.items():
            if isinstance(component, dict) and "entity" in component:
                entity_type = component.get("entity", "thing")
                score = self.semantic_intelligence.get_compatibility_score(
                    entity_type, "thing", relationship
                )
                debug_scores[slot_name] = {
                    "entity_type": entity_type,
                    "semantic_match": score.semantic_match,
                    "contextual_appropriateness": score.contextual_appropriateness,
                    "relationship_fit": score.relationship_fit,
                    "overall": score.overall
                }
        
        return debug_scores
