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
        """Pick actual vocab item for entity type with full metadata"""
        # Map entity types to vocab categories/tags
        entity_to_vocab_map = {
            "person": ["people", "pronoun", "student", "teacher", "occupation"],
            "thing": ["object", "food", "drink", "clothing", "furniture", "household"],
            "place": ["place", "location", "country", "school", "transport"],
            "concept": ["language", "vocabulary", "study", "time", "frequency"],
            "animal": ["people"],  # Using people as fallback
            "group": ["people", "occupation"],
            "event": ["time", "event"],
            "phenomenon": ["weather", "nature", "time"]
        }
        
        if entity_type not in entity_to_vocab_map:
            return None
            
        target_tags = entity_to_vocab_map[entity_type]
        
        # Find vocab items matching the entity type
        candidates = []
        for item in self.vocab:
            if any(tag in item.get("tags", []) for tag in target_tags):
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
        """Get a verb compatible with the entity type with full metadata"""
        compatible_verbs = self.resolve(entity_type, "compatible_verbs")
        if not compatible_verbs:
            return None
            
        # Find verbs with matching semantic tags
        candidates = []
        for verb in self.verbs:
            verb_semantics = verb.get("tags", {}).get("semantic", [])
            if any(semantic in compatible_verbs for semantic in verb_semantics):
                candidates.append(verb)
        
        if not candidates:
            return None
            
        return random.choice(candidates)
    
    def render(self, theme: str, structure: str, components: Dict[str, Any], 
               particles: List[str], extensions: List[str]) -> Sentence:
        """Assemble final sentence string"""
        # Build Japanese sentence
        japanese_parts = []
        
        # Helper function to extract display text from component
        def get_display_text(component):
            if isinstance(component, dict):
                return component.get("kana", component.get("hiragana", component.get("kanji", component.get("english", ""))))
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
        
        # Generate English translation (simplified)
        english = f"This is a {theme} sentence: {japanese}"
        
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
                    # Get compatible verb with full metadata
                    verb = self.get_compatible_verb("person")  # Simplified
                    if verb:
                        components[slot_name] = verb
                    else:
                        components[slot_name] = {
                            "english": "to do", 
                            "hiragana": "します",
                            "kanji": "します",
                            "tags": {"semantic": ["action"], "usage": ["daily"]},
                            "conjugations": {"polite": {"hiragana": "します"}}
                        }
                else:
                    components[slot_name] = {
                        "english": "to do", 
                        "hiragana": "します",
                        "kanji": "します",
                        "tags": {"semantic": ["action"], "usage": ["daily"]},
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
