import json
import random
from dataclasses import dataclass
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

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
    
    def get_compatible_verb(self, entity_type: str) -> Optional[Dict[str, Any]]:
        """Get a verb compatible with the entity type using new entity_tags system"""
        # Find verbs that are compatible with this entity type
        candidates = []
        for verb in self.verbs:
            verb_entity_tags = verb.get("entity_tags", [])
            if entity_type in verb_entity_tags:
                candidates.append(verb)
        
        if not candidates:
            # Fallback: use semantic matching
            compatible_verbs = self.resolve(entity_type, "compatible_verbs")
            for verb in self.verbs:
                verb_semantics = verb.get("semantic", [])
                if any(semantic in compatible_verbs for semantic in verb_semantics):
                    candidates.append(verb)
        
        if not candidates:
            return None
            
        return random.choice(candidates)
    
    def get_compatible_adjective(self, entity_type: str) -> Optional[Dict[str, Any]]:
        """Get an adjective compatible with the entity type using new entity_tags system"""
        # Find adjectives that can modify this entity type
        candidates = []
        for adjective in self.adjectives:
            adj_entity_tags = adjective.get("entity_tags", [])
            if entity_type in adj_entity_tags:
                candidates.append(adjective)
        
        if not candidates:
            return None
            
        return random.choice(candidates)
    
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
        """Generate a sentence using the specified theme or random theme"""
        if theme is None:
            theme = random.choice(list(self.rules.keys()))
        
        if theme not in self.rules:
            raise ValueError(f"Theme '{theme}' not found in rules")
        
        rule = self.rules[theme]
        structure = rule["structure"]
        slots = rule["slots"]
        particles = rule["particles"]
        extensions = rule["extensions"]
        
        components = {}
        
        # Fill slots with appropriate entities/vocab
        for slot_name, slot_config in slots.items():
            if isinstance(slot_config, list):
                # Direct entity type list
                entity_type = random.choice(slot_config)
                
                # Handle special cases
                if slot_name == "Adj":
                    # Get compatible adjective
                    adjective = self.get_compatible_adjective(entity_type)
                    if adjective:
                        components[slot_name] = adjective
                    else:
                        components[slot_name] = {"english": "good", "hiragana": "いい", "kanji": "いい"}
                else:
                    # Get vocab item for entity type
                    vocab_item = self.pick_entity_sample(entity_type)
                    if vocab_item:
                        # Store the full vocab item with all metadata
                        components[slot_name] = vocab_item
                    else:
                        components[slot_name] = {"english": f"[{entity_type}]", "kana": f"[{entity_type}]"}
                    
            elif isinstance(slot_config, dict) and "depends_on" in slot_config:
                # Dependent slot (e.g., verb compatibility)
                depends_on = slot_config["depends_on"]
                if depends_on in components:
                    # Get entity type from the component it depends on
                    dependent_component = components[depends_on]
                    entity_type = dependent_component.get("entity", "person")
                    
                    # Get compatible verb with full metadata
                    verb = self.get_compatible_verb(entity_type)
                    if verb:
                        components[slot_name] = verb
                    else:
                        components[slot_name] = {
                            "english": "to do", 
                            "hiragana": "します",
                            "kanji": "します",
                            "semantic": ["action"], 
                            "usage": ["daily"],
                            "entity_tags": ["person"],
                            "conjugations": {"polite": {"hiragana": "します"}}
                        }
                else:
                    components[slot_name] = {
                        "english": "to do", 
                        "hiragana": "します",
                        "kanji": "します",
                        "semantic": ["action"], 
                        "usage": ["daily"],
                        "entity_tags": ["person"],
                        "conjugations": {"polite": {"hiragana": "します"}}
                    }
        
        return self.render(theme, structure, components, particles, extensions)

def main():
    """Main function to demonstrate sentence generation"""
    generator = JapaneseSentenceGenerator()
    
    # Generate sentences for different themes
    themes = ["identity", "motion", "action_with_object", "description", "possession"]
    
    print("Japanese Sentence Generation Examples:")
    print("=" * 50)
    
    theme = random.choice(themes)
    try:
        sentence = generator.generate_sentence(theme)
        print(f"\nTheme: {theme}")
        print(f"Structure: {sentence.structure}")
        print(f"Japanese: {sentence.japanese}")
        print(f"English: {sentence.english}")
        # print(f"Components: {sentence.components}")
    except Exception as e:
        print(f"Error generating sentence for theme '{theme}': {e}")

if __name__ == "__main__":
    main()
