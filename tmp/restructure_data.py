#!/usr/bin/env python3
"""
Script to restructure vocab.json and verbs.json with proper entity classification
"""

import json
from pathlib import Path

def load_json(file_path):
    """Load JSON file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, file_path):
    """Save JSON file"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def categorize_vocab_by_entity(vocab_item):
    """Categorize vocab item by entity type based on tags and category"""
    category = vocab_item.get("category", "")
    tags = vocab_item.get("tags", [])
    english = vocab_item.get("english", "").lower()
    
    # Entity mapping based on category and tags
    if category == "noun":
        # Check tags for specific entity types
        if any(tag in ["people", "person", "student", "teacher", "occupation"] for tag in tags):
            return "person"
        elif any(tag in ["place", "location", "country", "school", "transport"] for tag in tags):
            return "place"
        elif any(tag in ["animal", "pet", "wildlife"] for tag in tags):
            return "animal"
        elif any(tag in ["food", "drink", "object", "clothing", "furniture", "household"] for tag in tags):
            return "thing"
        elif any(tag in ["organization", "company", "team", "group"] for tag in tags):
            return "group"
        elif any(tag in ["event", "festival", "exam", "meeting"] for tag in tags):
            return "event"
        elif any(tag in ["weather", "nature", "time", "phenomenon"] for tag in tags):
            return "phenomenon"
        elif any(tag in ["language", "vocabulary", "study", "concept"] for tag in tags):
            return "concept"
        else:
            # Default based on English meaning
            if any(word in english for word in ["teacher", "student", "person", "man", "woman", "child"]):
                return "person"
            elif any(word in english for word in ["school", "home", "office", "park", "city", "country"]):
                return "place"
            elif any(word in english for word in ["book", "pen", "car", "house", "food", "water"]):
                return "thing"
            else:
                return "thing"  # Default fallback
    elif category == "adjective":
        return "adjective"  # Will be handled separately
    elif category == "expression":
        return "expression"  # Will be handled separately
    else:
        return "thing"  # Default fallback

def get_entity_semantic_match(entity_type):
    """Get semantic match tags for entity type"""
    semantic_mapping = {
        "person": ["profession", "occupation", "nationality", "role"],
        "animal": ["species", "pet", "wildlife"],
        "thing": ["category", "material", "type"],
        "place": ["location_type", "country", "city"],
        "concept": ["field", "subject"],
        "group": ["organization", "company", "team"],
        "event": ["festival", "exam", "meeting", "incident"],
        "phenomenon": ["weather", "natural_force", "time"]
    }
    return semantic_mapping.get(entity_type, [])

def get_verb_entity_tags(verb_item):
    """Determine which entity types can use this verb"""
    semantic_tags = verb_item.get("tags", {}).get("semantic", [])
    usage_tags = verb_item.get("tags", {}).get("usage", [])
    
    # Map semantic tags to entity types
    entity_tags = []
    
    if "action" in semantic_tags:
        entity_tags.extend(["person", "animal"])
    if "cognitive" in semantic_tags:
        entity_tags.extend(["person"])
    if "communication" in semantic_tags:
        entity_tags.extend(["person", "group"])
    if "learning" in semantic_tags:
        entity_tags.extend(["person"])
    if "transaction" in semantic_tags:
        entity_tags.extend(["person", "group"])
    if "occupation" in semantic_tags:
        entity_tags.extend(["person"])
    if "social" in semantic_tags:
        entity_tags.extend(["person", "group"])
    if "motion" in semantic_tags:
        entity_tags.extend(["person", "animal"])
    if "emotion" in semantic_tags:
        entity_tags.extend(["person", "animal"])
    if "change" in semantic_tags:
        entity_tags.extend(["person", "thing", "place", "concept"])
    if "life" in semantic_tags:
        entity_tags.extend(["person", "animal"])
    if "physiological" in semantic_tags:
        entity_tags.extend(["person", "animal"])
    if "perception" in semantic_tags:
        entity_tags.extend(["person", "animal"])
    if "existence" in semantic_tags:
        entity_tags.extend(["person", "thing", "place", "concept", "group", "event", "phenomenon"])
    if "spatial" in semantic_tags:
        entity_tags.extend(["thing", "place"])
    if "weather" in semantic_tags:
        entity_tags.extend(["phenomenon"])
    if "nature" in semantic_tags:
        entity_tags.extend(["phenomenon"])
    if "temporal" in semantic_tags:
        entity_tags.extend(["event", "phenomenon"])
    if "initiation" in semantic_tags:
        entity_tags.extend(["event"])
    if "termination" in semantic_tags:
        entity_tags.extend(["event"])
    if "stative" in semantic_tags:
        entity_tags.extend(["person", "thing", "place", "concept"])
    
    # Remove duplicates and return
    return list(set(entity_tags))

def get_adjective_entity_tags(adjective_item):
    """Determine which entity types this adjective can modify"""
    tags = adjective_item.get("tags", [])
    english = adjective_item.get("english", "").lower()
    
    entity_tags = []
    
    # Check tags for entity compatibility
    if any(tag in ["people", "person"] for tag in tags):
        entity_tags.append("person")
    if any(tag in ["place", "location"] for tag in tags):
        entity_tags.append("place")
    if any(tag in ["object", "thing", "food", "clothing"] for tag in tags):
        entity_tags.append("thing")
    if any(tag in ["animal", "pet"] for tag in tags):
        entity_tags.append("animal")
    if any(tag in ["concept", "idea"] for tag in tags):
        entity_tags.append("concept")
    if any(tag in ["group", "organization"] for tag in tags):
        entity_tags.append("group")
    if any(tag in ["event", "occasion"] for tag in tags):
        entity_tags.append("event")
    if any(tag in ["weather", "nature"] for tag in tags):
        entity_tags.append("phenomenon")
    
    # If no specific tags, infer from English meaning
    if not entity_tags:
        if any(word in english for word in ["big", "small", "good", "bad", "new", "old", "hot", "cold"]):
            entity_tags = ["person", "thing", "place"]  # General adjectives
        elif any(word in english for word in ["beautiful", "handsome", "smart", "kind"]):
            entity_tags = ["person", "animal"]
        elif any(word in english for word in ["expensive", "cheap", "useful", "broken"]):
            entity_tags = ["thing"]
        elif any(word in english for word in ["far", "near", "big", "small"]):
            entity_tags = ["place", "thing"]
        else:
            entity_tags = ["thing"]  # Default fallback
    
    return list(set(entity_tags))

def main():
    """Main function to restructure the data"""
    print("🔄 Restructuring vocab.json and verbs.json with entity classification...")
    
    # Load existing data
    vocab_data = load_json("vocab.json")
    verbs_data = load_json("verbs.json")
    entities_data = load_json("entities.json")
    
    # Restructure vocab.json
    print("📝 Processing vocab.json...")
    new_vocab = []
    adjectives = []
    
    for item in vocab_data:
        entity_type = categorize_vocab_by_entity(item)
        
        if entity_type == "adjective":
            # Extract adjectives for separate file
            new_item = {
                "english": item["english"],
                "kanji": item.get("kanji", ""),
                "kana": item.get("kana", ""),
                "hiragana": item.get("hiragana", item.get("kana", "")),
                "romaji": item.get("romaji", ""),
                "entity_tags": get_adjective_entity_tags(item),
                "tags": item.get("tags", []),
                "jlpt_level": item.get("jlpt_level", ""),
                "priority_group": item.get("priority_group", "")
            }
            adjectives.append(new_item)
        else:
            # Regular vocab item
            new_item = {
                "english": item["english"],
                "kanji": item.get("kanji", ""),
                "kana": item.get("kana", ""),
                "hiragana": item.get("hiragana", item.get("kana", "")),
                "romaji": item.get("romaji", ""),
                "entity": entity_type,
                "semantic": get_entity_semantic_match(entity_type),
                "tags": item.get("tags", []),
                "jlpt_level": item.get("jlpt_level", ""),
                "priority_group": item.get("priority_group", ""),
                "category": item.get("category", "")
            }
            new_vocab.append(new_item)
    
    # Restructure verbs.json
    print("🔧 Processing verbs.json...")
    new_verbs = []
    
    for item in verbs_data:
        new_item = {
            "english": item["english"],
            "kanji": item.get("kanji", ""),
            "hiragana": item.get("hiragana", ""),
            "romaji": item.get("romaji", ""),
            "semantic": item.get("tags", {}).get("semantic", []),
            "usage": item.get("tags", {}).get("usage", []),
            "entity_tags": get_verb_entity_tags(item),
            "conjugation": item.get("tags", {}).get("conjugation", ""),
            "grammatical_type": item.get("grammatical_type", ""),
            "conjugations": item.get("conjugations", {})
        }
        new_verbs.append(new_item)
    
    # Save restructured files
    print("💾 Saving restructured files...")
    save_json(new_vocab, "vocab_enhanced.json")
    save_json(new_verbs, "verbs_enhanced.json")
    save_json(adjectives, "adjectives.json")
    
    print("✅ Restructuring complete!")
    print(f"📊 Stats:")
    print(f"  - Vocab items: {len(new_vocab)}")
    print(f"  - Verbs: {len(new_verbs)}")
    print(f"  - Adjectives: {len(adjectives)}")

if __name__ == "__main__":
    main()
