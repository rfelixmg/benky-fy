import json
import random
import argparse
from dataclasses import dataclass
from typing import Dict, List, Any, Optional, Union, Tuple
from pathlib import Path
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
    theme: str
    structure: str
    components: Dict[str, Any]  # Can contain full word metadata
    particles: List[str]
    extensions: List[str]

class JapaneseSentenceGenerator:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # Use the directory where this file is located
            self.data_dir = Path(__file__).parent
        else:
            self.data_dir = Path(data_dir)
        self.entities = self._load_json("entities.json")
        self.modifiers = self._load_json("modifiers.json")
        self.rules = self._load_json("rules.json")
        self.verbs = self._load_json("verbs.json")
        self.vocab = self._load_json("vocab.json")
        self.adjectives = self._load_json("adjectives.json")
        
        # Initialize semantic compatibility mappings
        self._init_semantic_mappings()
        
    def _load_json(self, filename: str) -> Dict[str, Any]:
        """Load JSON data from file"""
        file_path = self.data_dir / filename
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def resolve(self, entity: str, option_key: str) -> List[str]:
        """Resolve semantic matches or verb compatibility"""
        if entity in self.entities["entities"]:
            entity_data = self.entities["entities"][entity]
            if option_key in entity_data:
                return entity_data[option_key]
        return []
    
    def pick_entity_sample(self, entity_type: str) -> Optional[Dict[str, Any]]:
        """Pick actual vocab item for entity type with full metadata using new entity classification"""
        # Find vocab items that match the entity type
        candidates = []
        for item in self.vocab:
            if item.get("entity") == entity_type:
                candidates.append(item)
        
        if not candidates:
            # Fallback: try to find items with matching tags
            entity_semantic = self.resolve(entity_type, "semantic_match")
            for item in self.vocab:
                item_tags = item.get("tags", [])
                if any(tag in item_tags for tag in entity_semantic):
                    candidates.append(item)
        
        if not candidates:
            return None
            
        return random.choice(candidates)
    
    def _pick_adjective_sample(self) -> Optional[Dict[str, Any]]:
        """Pick a random adjective from the adjectives list"""
        if not self.adjectives:
            return None
        return random.choice(self.adjectives)
    
    def weighted_random_choice(self, choices: List[Any], weights: List[float] = None) -> Any:
        """Apply probabilities for weighted random selection"""
        if not choices:
            return None
            
        if weights is None:
            return random.choice(choices)
            
        if len(weights) != len(choices):
            weights = [1.0] * len(choices)
            
        return random.choices(choices, weights=weights)[0]
    
    def apply_modifier(self, word: str, modifier_type: str) -> str:
        """Attach modifiers to nouns/verbs"""
        if modifier_type not in self.modifiers["modifiers"]:
            return word
            
        modifier_data = self.modifiers["modifiers"][modifier_type]
        
        # Skip if probability check fails
        if random.random() > modifier_data.get("probability", 0.5):
            return word
            
        if modifier_type == "demonstrative":
            forms = modifier_data.get("forms", [])
            if forms:
                return f"{random.choice(forms)} {word}"
                
        elif modifier_type == "demonstrative_place":
            forms = modifier_data.get("forms", [])
            if forms:
                return random.choice(forms)
                
        elif modifier_type in ["adverb_manner", "adverb_frequency", "adverb_degree"]:
            examples = modifier_data.get("examples", [])
            if examples:
                return f"{random.choice(examples)} {word}"
                
        elif modifier_type == "temporal":
            examples = modifier_data.get("examples", [])
            if examples:
                return f"{random.choice(examples)} {word}"
                
        return word
    
    def get_verb_conjugation(self, verb: Dict[str, Any], conjugation_type: str = "polite") -> str:
        """Get verb conjugation"""
        conjugations = verb.get("conjugations", {})
        if conjugation_type in conjugations:
            return conjugations[conjugation_type].get("hiragana", verb.get("hiragana", ""))
        return verb.get("hiragana", "")
    
    def get_compatible_verb(self, entity_type: str, relationship: RelationshipType = None) -> Optional[Dict[str, Any]]:
        """Get a verb compatible with the entity type using semantic intelligence"""
        if relationship is None:
            relationship = RelationshipType.ACTION  # Default relationship
        
        # Get smart compatibility scores
        compatible_verbs = self.get_smart_verb_compatibility(entity_type, relationship)
        
        if not compatible_verbs:
            # No compatible verbs found
            return None
        
        # Use weighted random selection based on compatibility scores
        verbs, scores = zip(*compatible_verbs)
        # Normalize scores to probabilities
        total_score = sum(scores)
        probabilities = [score / total_score for score in scores]
        
        return random.choices(verbs, weights=probabilities)[0]
    
    def get_compatible_adjective(self, entity_type: str, relationship: RelationshipType = None) -> Optional[Dict[str, Any]]:
        """Get an adjective compatible with the entity type using semantic intelligence"""
        if relationship is None:
            relationship = RelationshipType.DESCRIPTION  # Default relationship
        
        # Get smart compatibility scores
        compatible_adjectives = self.get_smart_adjective_compatibility(entity_type, relationship)
        
        if not compatible_adjectives:
            # No compatible adjectives found
            return None
        
        # Use weighted random selection based on compatibility scores
        adjectives, scores = zip(*compatible_adjectives)
        # Normalize scores to probabilities
        total_score = sum(scores)
        probabilities = [score / total_score for score in scores]
        
        return random.choices(adjectives, weights=probabilities)[0]
    
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
        
        # Calculate based on shared domains
        domains1 = set(self.entity_domains.get(entity1, []))
        domains2 = set(self.entity_domains.get(entity2, []))
        
        if not domains1 or not domains2:
            return 0.3  # Default low compatibility
        
        # Jaccard similarity of domains
        intersection = len(domains1.intersection(domains2))
        union = len(domains1.union(domains2))
        
        if union == 0:
            return 0.3
        
        similarity = intersection / union
        return max(0.3, similarity)  # Minimum compatibility of 0.3
    
    def calculate_contextual_appropriateness(self, entity1: str, entity2: str, 
                                            relationship: RelationshipType) -> float:
        """Calculate contextual appropriateness for a relationship"""
        if relationship not in self.contextual_rules:
            return 0.5  # Default moderate appropriateness
        
        rules = self.contextual_rules[relationship]
        if entity1 not in rules:
            return 0.3  # Low appropriateness if no rules defined
        
        if entity2 in rules[entity1]:
            return 0.9  # High appropriateness if explicitly allowed
        else:
            return 0.4  # Moderate appropriateness if not explicitly allowed
    
    def calculate_relationship_fit(self, entity1: str, entity2: str, 
                                 relationship: RelationshipType) -> float:
        """Calculate how well entities fit the relationship type"""
        # Define relationship-specific entity preferences
        relationship_preferences = {
            RelationshipType.OWNERSHIP: {
                "person": 0.9,  # People commonly own things
                "group": 0.8,   # Groups can own things
                "thing": 0.1,   # Things rarely own other things
                "animal": 0.2   # Animals rarely own things
            },
            RelationshipType.ACTION: {
                "person": 0.9,  # People commonly perform actions
                "animal": 0.7,  # Animals can perform actions
                "thing": 0.1,   # Things rarely perform actions
                "group": 0.6    # Groups can perform actions
            },
            RelationshipType.LOCATION: {
                "person": 0.8,  # People are commonly at locations
                "animal": 0.8,  # Animals are commonly at locations
                "thing": 0.7,   # Things are commonly at locations
                "group": 0.6    # Groups can be at locations
            },
            RelationshipType.DESCRIPTION: {
                "person": 0.8,  # People are commonly described
                "thing": 0.9,   # Things are commonly described
                "place": 0.8,   # Places are commonly described
                "animal": 0.7   # Animals are commonly described
            }
        }
        
        if relationship not in relationship_preferences:
            return 0.5
        
        preferences = relationship_preferences[relationship]
        entity1_fit = preferences.get(entity1, 0.5)
        entity2_fit = preferences.get(entity2, 0.5)
        
        # Average the fits, with slight bias toward the first entity
        return (entity1_fit * 0.6 + entity2_fit * 0.4)
    
    def get_compatibility_score(self, entity1: str, entity2: str, 
                              relationship: RelationshipType) -> CompatibilityScore:
        """Calculate overall compatibility score between two entities for a relationship"""
        semantic_match = self.calculate_semantic_compatibility(entity1, entity2)
        contextual_appropriateness = self.calculate_contextual_appropriateness(entity1, entity2, relationship)
        relationship_fit = self.calculate_relationship_fit(entity1, entity2, relationship)
        
        return CompatibilityScore(
            semantic_match=semantic_match,
            contextual_appropriateness=contextual_appropriateness,
            relationship_fit=relationship_fit,
            overall=0.0  # Will be calculated in __post_init__
        )
    
    def get_smart_verb_compatibility(self, entity_type: str, relationship: RelationshipType) -> List[Tuple[Dict[str, Any], float]]:
        """Get verbs with compatibility scores for an entity type and relationship"""
        candidates = []
        
        for verb in self.verbs:
            verb_entity_tags = verb.get("entity_tags", [])
            verb_semantics = verb.get("semantic", [])
            
            # Calculate compatibility score
            compatibility_score = 0.0
            
            # Entity tag compatibility
            if entity_type in verb_entity_tags:
                compatibility_score += 0.4
            
            # Semantic domain compatibility
            entity_domains = self.entity_domains.get(entity_type, [])
            verb_domains = self._get_verb_domains(verb_semantics)
            domain_overlap = len(set(entity_domains).intersection(set(verb_domains)))
            if domain_overlap > 0:
                compatibility_score += 0.3 * (domain_overlap / len(entity_domains))
            
            # Relationship-specific compatibility
            relationship_compatibility = self._get_verb_relationship_compatibility(verb_semantics, relationship)
            compatibility_score += relationship_compatibility * 0.3
            
            if compatibility_score > 0.2:  # Only include verbs with reasonable compatibility
                candidates.append((verb, compatibility_score))
        
        # Sort by compatibility score (highest first)
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates
    
    def _get_verb_domains(self, verb_semantics: List[str]) -> List[SemanticDomain]:
        """Map verb semantics to semantic domains"""
        domain_mapping = {
            "action": SemanticDomain.DAILY_LIFE,
            "cognitive": SemanticDomain.ACADEMIC,
            "communication": SemanticDomain.SOCIAL,
            "learning": SemanticDomain.ACADEMIC,
            "transaction": SemanticDomain.PROFESSIONAL,
            "occupation": SemanticDomain.PROFESSIONAL,
            "social": SemanticDomain.SOCIAL,
            "motion": SemanticDomain.PHYSICAL,
            "emotion": SemanticDomain.EMOTIONAL,
            "change": SemanticDomain.ABSTRACT,
            "life": SemanticDomain.DAILY_LIFE,
            "physiological": SemanticDomain.PHYSICAL,
            "perception": SemanticDomain.PHYSICAL,
            "existence": SemanticDomain.ABSTRACT,
            "spatial": SemanticDomain.SPATIAL,
            "weather": SemanticDomain.PHYSICAL,
            "nature": SemanticDomain.PHYSICAL,
            "temporal": SemanticDomain.TEMPORAL,
            "initiation": SemanticDomain.ABSTRACT,
            "termination": SemanticDomain.ABSTRACT,
            "stative": SemanticDomain.ABSTRACT
        }
        
        domains = []
        for semantic in verb_semantics:
            if semantic in domain_mapping:
                domains.append(domain_mapping[semantic])
        
        return domains
    
    def _get_verb_relationship_compatibility(self, verb_semantics: List[str], relationship: RelationshipType) -> float:
        """Calculate how well verb semantics match the relationship type"""
        relationship_semantics = {
            RelationshipType.ACTION: ["action", "motion", "transaction", "communication"],
            RelationshipType.LOCATION: ["motion", "spatial", "existence"],
            RelationshipType.DESCRIPTION: ["stative", "existence", "emotion"],
            RelationshipType.OWNERSHIP: ["transaction", "existence"],
            RelationshipType.IDENTITY: ["stative", "existence"],
            RelationshipType.ATTRIBUTION: ["stative", "existence", "emotion"]
        }
        
        if relationship not in relationship_semantics:
            return 0.5
        
        preferred_semantics = relationship_semantics[relationship]
        overlap = len(set(verb_semantics).intersection(set(preferred_semantics)))
        
        if not preferred_semantics:
            return 0.5
        
        return overlap / len(preferred_semantics)
    
    def get_smart_adjective_compatibility(self, entity_type: str, relationship: RelationshipType) -> List[Tuple[Dict[str, Any], float]]:
        """Get adjectives with compatibility scores for an entity type and relationship"""
        candidates = []
        
        for adjective in self.adjectives:
            adj_entity_tags = adjective.get("entity_tags", [])
            adj_tags = adjective.get("tags", [])
            
            # Calculate compatibility score
            compatibility_score = 0.0
            
            # Entity tag compatibility
            if entity_type in adj_entity_tags:
                compatibility_score += 0.5
            
            # Relationship-specific compatibility
            relationship_compatibility = self._get_adjective_relationship_compatibility(adj_tags, relationship)
            compatibility_score += relationship_compatibility * 0.3
            
            # Contextual appropriateness
            contextual_fit = self._get_adjective_contextual_fit(adj_tags, entity_type)
            compatibility_score += contextual_fit * 0.2
            
            if compatibility_score > 0.3:  # Only include adjectives with reasonable compatibility
                candidates.append((adjective, compatibility_score))
        
        # Sort by compatibility score (highest first)
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates
    
    def _get_adjective_relationship_compatibility(self, adj_tags: List[str], relationship: RelationshipType) -> float:
        """Calculate how well adjective tags match the relationship type"""
        relationship_tags = {
            RelationshipType.DESCRIPTION: ["description", "feelings", "study", "daily life", "people"],
            RelationshipType.ATTRIBUTION: ["description", "feelings", "places", "taste", "quantity"],
            RelationshipType.OWNERSHIP: ["description", "feelings"],
            RelationshipType.IDENTITY: ["description", "feelings", "people"]
        }
        
        if relationship not in relationship_tags:
            return 0.5
        
        preferred_tags = relationship_tags[relationship]
        overlap = len(set(adj_tags).intersection(set(preferred_tags)))
        
        if not preferred_tags:
            return 0.5
        
        return overlap / len(preferred_tags)
    
    def _get_adjective_contextual_fit(self, adj_tags: List[str], entity_type: str) -> float:
        """Calculate contextual fit of adjective for entity type"""
        entity_tag_preferences = {
            "person": ["people", "feelings", "description"],
            "thing": ["description", "feelings", "taste", "quantity", "study", "daily life"],
            "place": ["places", "description", "feelings"],
            "animal": ["description", "feelings"],
            "concept": ["study", "description", "feelings"],
            "group": ["people", "description", "feelings"],
            "event": ["feelings", "description"],
            "phenomenon": ["description", "feelings"]
        }
        
        if entity_type not in entity_tag_preferences:
            return 0.5
        
        preferred_tags = entity_tag_preferences[entity_type]
        overlap = len(set(adj_tags).intersection(set(preferred_tags)))
        
        if not preferred_tags:
            return 0.5
        
        return overlap / len(preferred_tags)
    
    def generate_english_translation(self, theme: str, structure: str, components: Dict[str, Any]) -> str:
        """Generate proper English translation based on structure and components"""
        # Helper function to get English text from component
        def get_english_text(component):
            if isinstance(component, dict):
                return component.get("english", "")
            return str(component)
        
        # Generate translation based on structure
        if "A は B です" in structure:
            a_text = get_english_text(components.get('A', ''))
            b_text = get_english_text(components.get('B', ''))
            return f"{a_text} is {b_text}"
            
        elif "A を Verb" in structure:
            a_text = get_english_text(components.get('A', ''))
            verb_text = get_english_text(components.get('Verb', ''))
            return f"{a_text} {verb_text}"
            
        elif "A で Verb" in structure:
            a_text = get_english_text(components.get('A', ''))
            verb_text = get_english_text(components.get('Verb', ''))
            return f"{verb_text} at {a_text}"
            
        elif "A へ/に Verb" in structure or "A は Place に Verb" in structure:
            a_text = get_english_text(components.get('A', ''))
            verb_text = get_english_text(components.get('Verb', ''))
            if "Place" in components:
                place_text = get_english_text(components.get('Place', ''))
                return f"{a_text} {verb_text} to {place_text}"
            else:
                return f"{a_text} {verb_text}"
                
        elif "A の B" in structure:
            a_text = get_english_text(components.get('A', ''))
            b_text = get_english_text(components.get('B', ''))
            return f"{a_text}'s {b_text}"
            
        elif "A は Adj です" in structure:
            a_text = get_english_text(components.get('A', ''))
            adj_text = get_english_text(components.get('Adj', ''))
            return f"{a_text} is {adj_text}"
            
        elif "Adj + Noun" in structure:
            adj_text = get_english_text(components.get('Adj', ''))
            noun_text = get_english_text(components.get('Noun', ''))
            return f"{adj_text} {noun_text}"
            
        elif "A が Verb" in structure:
            a_text = get_english_text(components.get('A', ''))
            verb_text = get_english_text(components.get('Verb', ''))
            return f"{a_text} {verb_text}"
            
        elif "A は B が Adj" in structure:
            a_text = get_english_text(components.get('A', ''))
            b_text = get_english_text(components.get('B', ''))
            adj_text = get_english_text(components.get('Adj', ''))
            return f"{a_text}'s {b_text} is {adj_text}"
            
        else:
            # Fallback: combine all components
            parts = [get_english_text(comp) for comp in components.values()]
            return " ".join(parts)
    
    def render(self, theme: str, structure: str, components: Dict[str, Any], 
               particles: List[str], extensions: List[str]) -> Sentence:
        """Assemble final sentence string"""
        # Build Japanese sentence
        japanese_parts = []
        
        # Helper function to extract display text from component
        def get_display_text(component):
            if isinstance(component, dict):
                return component.get("hiragana", component.get("kana", component.get("kanji", component.get("english", ""))))
            return str(component)
        
        # Handle different structures
        if "A は B です" in structure:
            japanese_parts.append(f"{get_display_text(components.get('A', ''))} は {get_display_text(components.get('B', ''))} です")
        elif "A を Verb" in structure:
            verb_form = self.get_verb_conjugation(components.get('Verb', {}), "polite")
            japanese_parts.append(f"{get_display_text(components.get('A', ''))} を {verb_form}")
        elif "A で Verb" in structure:
            verb_form = self.get_verb_conjugation(components.get('Verb', {}), "polite")
            japanese_parts.append(f"{get_display_text(components.get('A', ''))} で {verb_form}")
        elif "A へ/に Verb" in structure or "A は Place に Verb" in structure:
            verb_form = self.get_verb_conjugation(components.get('Verb', {}), "polite")
            if "Place" in components:
                japanese_parts.append(f"{get_display_text(components.get('A', ''))} は {get_display_text(components.get('Place', ''))} に {verb_form}")
            else:
                japanese_parts.append(f"{get_display_text(components.get('A', ''))} へ {verb_form}")
        elif "A の B" in structure:
            japanese_parts.append(f"{get_display_text(components.get('A', ''))} の {get_display_text(components.get('B', ''))}")
        elif "A は Adj です" in structure:
            japanese_parts.append(f"{get_display_text(components.get('A', ''))} は {get_display_text(components.get('Adj', ''))} です")
        elif "Adj + Noun" in structure:
            japanese_parts.append(f"{get_display_text(components.get('Adj', ''))} {get_display_text(components.get('Noun', ''))}")
        elif "A が Verb" in structure:
            verb_form = self.get_verb_conjugation(components.get('Verb', {}), "polite")
            japanese_parts.append(f"{get_display_text(components.get('A', ''))} が {verb_form}")
        elif "A は B が Adj" in structure:
            japanese_parts.append(f"{get_display_text(components.get('A', ''))} は {get_display_text(components.get('B', ''))} が {get_display_text(components.get('Adj', ''))} です")
        else:
            # Fallback for other structures
            japanese_parts.append(" ".join(get_display_text(comp) for comp in components.values()))
        
        japanese = " ".join(japanese_parts)
        
        # Generate proper English translation
        english = self.generate_english_translation(theme, structure, components)
        
        return Sentence(
            japanese=japanese,
            english=english,
            theme=theme,
            structure=structure,
            components=components,
            particles=particles,
            extensions=extensions
        )
    
    def generate_sentence(self, theme: str = None) -> Sentence:
        """Generate a sentence using the specified theme or random theme with semantic intelligence"""
        if theme is None:
            theme = random.choice(list(self.rules.keys()))
        
        if theme not in self.rules:
            raise ValueError(f"Theme '{theme}' not found in rules")
        
        rule = self.rules[theme]
        structure = rule["structure"]
        slots = rule["slots"]
        particles = rule["particles"]
        extensions = rule["extensions"]
        
        # Determine the relationship type for this structure
        relationship = self.structure_relationships.get(structure, RelationshipType.ACTION)
        
        components = {}
        
        # Fill slots with appropriate entities/vocab using semantic intelligence
        for slot_name, slot_config in slots.items():
            if isinstance(slot_config, list):
                # Direct entity type list - use smart selection
                entity_type = self._smart_entity_selection(slot_config, components, relationship)
                
                # Handle special cases
                if slot_name == "Adj":
                    # For adjectives, pick from the adjectives list directly
                    adjective = self._pick_adjective_sample()
                    if adjective:
                        components[slot_name] = adjective
                    else:
                        components[slot_name] = {"english": "[NOT FOUND]", "hiragana": "[NOT FOUND]", "kanji": "[NOT FOUND]"}
                else:
                    # Get vocab item for entity type
                    vocab_item = self.pick_entity_sample(entity_type)
                    if vocab_item:
                        # Store the full vocab item with all metadata
                        components[slot_name] = vocab_item
                    else:
                        components[slot_name] = {"english": "[NOT FOUND]", "kana": "[NOT FOUND]", "hiragana": "[NOT FOUND]"}
                    
            elif isinstance(slot_config, dict) and "depends_on" in slot_config:
                # Dependent slot (e.g., verb compatibility)
                depends_on = slot_config["depends_on"]
                if depends_on in components:
                    # Get entity type from the component it depends on
                    dependent_component = components[depends_on]
                    entity_type = dependent_component.get("entity", "person")
                    
                    # Get compatible verb with relationship context
                    verb = self.get_compatible_verb(entity_type, relationship)
                    if verb:
                        components[slot_name] = verb
                    else:
                        components[slot_name] = {
                            "english": "[NOT FOUND]", 
                            "hiragana": "[NOT FOUND]",
                            "kanji": "[NOT FOUND]",
                            "semantic": ["action"], 
                            "usage": ["daily"],
                            "entity_tags": ["person"],
                            "conjugations": {"polite": {"hiragana": "[NOT FOUND]"}}
                        }
                else:
                    components[slot_name] = {
                        "english": "[NOT FOUND]", 
                        "hiragana": "[NOT FOUND]",
                        "kanji": "[NOT FOUND]",
                        "semantic": ["action"], 
                        "usage": ["daily"],
                        "entity_tags": ["person"],
                        "conjugations": {"polite": {"hiragana": "[NOT FOUND]"}}
                    }
        
        return self.render(theme, structure, components, particles, extensions)
    
    def _smart_entity_selection(self, entity_options: List[str], existing_components: Dict[str, Any], 
                               relationship: RelationshipType) -> str:
        """Smart entity selection based on semantic compatibility with existing components"""
        if not existing_components:
            # No existing components, just pick randomly
            return random.choice(entity_options)
        
        # Calculate compatibility scores for each entity option
        compatibility_scores = []
        for entity_type in entity_options:
            total_score = 0.0
            count = 0
            
            for existing_component in existing_components.values():
                if isinstance(existing_component, dict):
                    existing_entity = existing_component.get("entity", "thing")
                    score = self.get_compatibility_score(entity_type, existing_entity, relationship)
                    total_score += score.overall
                    count += 1
            
            if count > 0:
                avg_score = total_score / count
            else:
                avg_score = 0.5  # Default moderate score
            
            compatibility_scores.append((entity_type, avg_score))
        
        # Sort by compatibility score (highest first)
        compatibility_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Use weighted random selection favoring higher compatibility
        # Take top 3 most compatible options and weight them
        top_options = compatibility_scores[:3]
        if len(top_options) == 1:
            return top_options[0][0]
        
        # Create weights based on compatibility scores
        weights = []
        for _, score in top_options:
            # Ensure minimum weight and scale appropriately
            weight = max(0.1, score)
            weights.append(weight)
        
        # Select using weighted random choice
        entity_types, _ = zip(*top_options)
        return random.choices(entity_types, weights=weights)[0]
    
    def check_coherence(self, sentence: Sentence) -> Tuple[bool, List[str]]:
        """Check if the generated sentence is coherent and makes logical sense"""
        issues = []
        
        # Check for [NOT FOUND] placeholders
        if "[NOT FOUND]" in sentence.japanese or "[NOT FOUND]" in sentence.english:
            issues.append("Contains [NOT FOUND] placeholders - missing vocabulary")
        
        # Check for semantic coherence based on relationship type
        relationship = self.structure_relationships.get(sentence.structure, RelationshipType.ACTION)
        
        if relationship == RelationshipType.OWNERSHIP:
            # Check if ownership makes sense
            if not self._check_ownership_coherence(sentence.components):
                issues.append("Ownership relationship doesn't make logical sense")
        
        elif relationship == RelationshipType.ACTION:
            # Check if action makes sense
            if not self._check_action_coherence(sentence.components):
                issues.append("Action relationship doesn't make logical sense")
        
        elif relationship == RelationshipType.LOCATION:
            # Check if motion/location makes sense
            if not self._check_motion_coherence(sentence.components):
                issues.append("Motion/location relationship doesn't make logical sense")
        
        elif relationship == RelationshipType.DESCRIPTION:
            # Check if description makes sense
            if not self._check_description_coherence(sentence.components):
                issues.append("Description relationship doesn't make logical sense")
        
        elif relationship == RelationshipType.IDENTITY:
            # Check if identity makes sense
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
            "excited": ["person", "animal"],  # Excited people/animals - NOT things/places
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
        
        a = components["A"]
        b = components["B"]
        
        if not isinstance(a, dict) or not isinstance(b, dict):
            return False
        
        a_entity = a.get("entity", "thing")
        b_entity = b.get("entity", "thing")
        
        # Same entity types can be identical
        if a_entity == b_entity:
            return True
        
        # Some cross-entity identities make sense
        if (a_entity == "person" and b_entity == "concept") or (a_entity == "concept" and b_entity == "person"):
            return True
        
        if (a_entity == "thing" and b_entity == "concept") or (a_entity == "concept" and b_entity == "thing"):
            return True
        
        return False
    
    def _check_domain_coherence(self, components: Dict[str, Any]) -> bool:
        """Check if components share coherent semantic domains"""
        if len(components) < 2:
            return True
        
        domains = []
        for component in components.values():
            if isinstance(component, dict):
                entity = component.get("entity", "thing")
                entity_domains = self.entity_domains.get(entity, [])
                domains.append(set(entity_domains))
        
        if not domains:
            return True
        
        # Check if there's any domain overlap
        base_domains = domains[0]
        for other_domains in domains[1:]:
            if base_domains.intersection(other_domains):
                return True
        
        return False
    
    def _check_contextual_appropriateness(self, components: Dict[str, Any], relationship: RelationshipType) -> bool:
        """Check if components are contextually appropriate for the relationship"""
        if len(components) < 2:
            return True
        
        component_entities = []
        for component in components.values():
            if isinstance(component, dict):
                entity = component.get("entity", "thing")
                component_entities.append(entity)
        
        if len(component_entities) < 2:
            return True
        
        # Check contextual appropriateness for the relationship
        for i in range(len(component_entities) - 1):
            entity1 = component_entities[i]
            entity2 = component_entities[i + 1]
            
            appropriateness = self.calculate_contextual_appropriateness(entity1, entity2, relationship)
            if appropriateness < 0.3:  # Low appropriateness threshold
                return False
        
        return True

def main():
    """Main function to demonstrate sentence generation with command-line arguments"""
    parser = argparse.ArgumentParser(description='Japanese Sentence Generator with Semantic Intelligence')
    parser.add_argument('--theme', '-t', type=str, help='Specific theme to test (e.g., identity, motion, description)')
    parser.add_argument('--count', '-c', type=int, default=1, help='Number of sentences to generate (default: 1)')
    parser.add_argument('--list-themes', '-l', action='store_true', help='List all available themes')
    parser.add_argument('--debug', '-d', action='store_true', help='Show detailed component information')
    parser.add_argument('--coherent-only', action='store_true', help='Only show coherent sentences')
    
    args = parser.parse_args()
    
    generator = JapaneseSentenceGenerator()
    
    # Get all available themes
    available_themes = list(generator.rules.keys())
    
    if args.list_themes:
        print("Available themes:")
        for theme in available_themes:
            structure = generator.rules[theme]["structure"]
            print(f"  {theme}: {structure}")
        return
    
    # Determine which theme(s) to use
    if args.theme:
        if args.theme not in available_themes:
            print(f"Error: Theme '{args.theme}' not found.")
            print(f"Available themes: {', '.join(available_themes)}")
            return
        themes_to_test = [args.theme]
    else:
        themes_to_test = available_themes
    
    print("Japanese Sentence Generation Examples:")
    print("=" * 50)
    
    sentences_generated = 0
    attempts = 0
    max_attempts = args.count * 10  # Prevent infinite loops
    
    while sentences_generated < args.count and attempts < max_attempts:
        attempts += 1
        theme = random.choice(themes_to_test)
        
        try:
            sentence = generator.generate_sentence(theme)
            is_coherent, issues = generator.check_coherence(sentence)
            
            # Skip incoherent sentences if coherent-only is requested
            if args.coherent_only and not is_coherent:
                continue
            
            sentences_generated += 1
            
            # Enhanced structured display
            print(f"\n{'='*60}")
            print(f"Structure: {sentence.structure}")
            print(f"Theme: {theme}")
            print()
            
            print("Components:")
            for key, component in sentence.components.items():
                if isinstance(component, dict):
                    english = component.get('english', '[NO ENGLISH]')
                    hiragana = component.get('hiragana', component.get('kana', '[NO KANA]'))
                    print(f"  {key}: {english} | {hiragana}")
                else:
                    print(f"  {key}: {component}")
            
            print()
            print(f"Japanese: {sentence.japanese}")
            print(f"English: {sentence.english}")
            print()
            
            print("Checks:")
            status = "✓ PASS" if is_coherent else "✗ FAIL"
            print(f"  Coherence: {status}")
            if issues:
                for issue in issues:
                    print(f"  Issue: {issue}")
            else:
                print("  No issues detected")
            
            if args.debug:
                print()
                print("Debug Info:")
                print(f"  Particles: {sentence.particles}")
                print(f"  Extensions: {sentence.extensions}")
                print(f"  Relationship: {generator.structure_relationships.get(sentence.structure, 'Unknown')}")
                
        except Exception as e:
            print(f"Error generating sentence for theme '{theme}': {e}")
    
    if sentences_generated == 0 and args.coherent_only:
        print(f"\nNo coherent sentences found after {attempts} attempts.")
        print("Try running without --coherent-only to see what's being generated.")

if __name__ == "__main__":
    main()
