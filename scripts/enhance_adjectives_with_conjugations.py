#!/usr/bin/env python3
"""
Enhance adjectives.json with conjugation data for i-adjectives and na-adjectives.
"""

import json
import re
from typing import Dict, Any, List

def categorize_adjective(adj: Dict[str, Any]) -> str:
    """Categorize adjective as i-adjective, na-adjective, or special case"""
    hiragana = adj.get('hiragana', '')
    kanji = adj.get('kanji', '')
    
    # Special cases that end in い but are na-adjectives
    special_na_adjectives = {
        'きれい', 'ゆうめい', 'きらい', 'すき', 'へん', 'べんり'
    }
    
    # Check if it's a special case
    if hiragana in special_na_adjectives or kanji in special_na_adjectives:
        return 'na_adjective_special'
    
    # Check if it ends in い (hiragana)
    if hiragana.endswith('い'):
        return 'i_adjective'
    
    # Everything else is na-adjective
    return 'na_adjective'

def generate_i_adjective_conjugations(adj: Dict[str, Any]) -> Dict[str, Any]:
    """Generate conjugations for i-adjectives"""
    kanji = adj.get('kanji', '')
    hiragana = adj.get('hiragana', '')
    romaji = adj.get('romaji', '')
    
    # Handle special case: いい (good) - irregular
    if hiragana == 'いい':
        return {
            "conjugation_type": "i_adjective_irregular",
            "conjugations": {
                "present": {"kanji": "いい", "hiragana": "いい", "romaji": "ii"},
                "past": {"kanji": "よかった", "hiragana": "よかった", "romaji": "yokatta"},
                "negative": {"kanji": "よくない", "hiragana": "よくない", "romaji": "yokunai"},
                "negative_past": {"kanji": "よくなかった", "hiragana": "よくなかった", "romaji": "yokunakatta"},
                "adverbial": {"kanji": "よく", "hiragana": "よく", "romaji": "yoku"}
            }
        }
    
    # Regular i-adjective conjugations
    # Remove the final い
    kanji_stem = kanji[:-1] if kanji.endswith('い') else kanji
    hiragana_stem = hiragana[:-1] if hiragana.endswith('い') else hiragana
    romaji_stem = romaji[:-1] if romaji.endswith('i') else romaji
    
    return {
        "conjugation_type": "i_adjective",
        "conjugations": {
            "present": {"kanji": kanji, "hiragana": hiragana, "romaji": romaji},
            "past": {"kanji": kanji_stem + "かった", "hiragana": hiragana_stem + "かった", "romaji": romaji_stem + "katta"},
            "negative": {"kanji": kanji_stem + "くない", "hiragana": hiragana_stem + "くない", "romaji": romaji_stem + "kunai"},
            "negative_past": {"kanji": kanji_stem + "くなかった", "hiragana": hiragana_stem + "くなかった", "romaji": romaji_stem + "kunakatta"},
            "adverbial": {"kanji": kanji_stem + "く", "hiragana": hiragana_stem + "く", "romaji": romaji_stem + "ku"}
        }
    }

def generate_na_adjective_conjugations(adj: Dict[str, Any]) -> Dict[str, Any]:
    """Generate conjugations for na-adjectives"""
    kanji = adj.get('kanji', '')
    hiragana = adj.get('hiragana', '')
    romaji = adj.get('romaji', '')
    
    return {
        "conjugation_type": "na_adjective",
        "conjugations": {
            "present": {"kanji": kanji, "hiragana": hiragana, "romaji": romaji},
            "past": {"kanji": kanji + "だった", "hiragana": hiragana + "だった", "romaji": romaji + " datta"},
            "negative": {"kanji": kanji + "ではない", "hiragana": hiragana + "ではない", "romaji": romaji + " dewa nai"},
            "negative_past": {"kanji": kanji + "ではなかった", "hiragana": hiragana + "ではなかった", "romaji": romaji + " dewa nakatta"},
            "adverbial": {"kanji": kanji + "に", "hiragana": hiragana + "に", "romaji": romaji + " ni"}
        }
    }

def enhance_adjective_with_conjugations(adj: Dict[str, Any]) -> Dict[str, Any]:
    """Add conjugation data to an adjective"""
    category = categorize_adjective(adj)
    
    if category == 'i_adjective':
        conjugation_data = generate_i_adjective_conjugations(adj)
    elif category in ['na_adjective', 'na_adjective_special']:
        conjugation_data = generate_na_adjective_conjugations(adj)
    else:
        # Fallback - treat as na-adjective
        conjugation_data = generate_na_adjective_conjugations(adj)
    
    # Add conjugation data to the adjective
    enhanced_adj = adj.copy()
    enhanced_adj.update(conjugation_data)
    
    return enhanced_adj

def load_adjectives(filename: str) -> List[Dict[str, Any]]:
    """Load adjectives from JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_adjectives(filename: str, adjectives: List[Dict[str, Any]]):
    """Save enhanced adjectives to JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(adjectives, f, ensure_ascii=False, indent=2)

def enhance_adjectives(input_file: str, output_file: str = None):
    """Enhance adjectives with conjugation data"""
    if output_file is None:
        output_file = input_file
    
    print(f"Loading adjectives from {input_file}...")
    adjectives = load_adjectives(input_file)
    
    print(f"Enhancing {len(adjectives)} adjectives with conjugation data...")
    enhanced_adjectives = []
    
    for i, adj in enumerate(adjectives):
        try:
            enhanced_adj = enhance_adjective_with_conjugations(adj)
            enhanced_adjectives.append(enhanced_adj)
            
            if (i + 1) % 10 == 0:
                print(f"Processed {i + 1}/{len(adjectives)} adjectives...")
                
        except Exception as e:
            print(f"Error processing adjective {i}: {adj.get('english', 'unknown')} - {e}")
            # Add original adjective without conjugation data
            enhanced_adjectives.append(adj)
    
    print(f"Saving enhanced adjectives to {output_file}...")
    save_adjectives(output_file, enhanced_adjectives)
    
    print("✅ Enhancement complete!")
    return enhanced_adjectives

def verify_conjugations(adjectives: List[Dict[str, Any]]):
    """Verify conjugation data integrity"""
    print("\n=== VERIFICATION ===")
    
    i_adjectives = 0
    na_adjectives = 0
    irregular = 0
    
    for adj in adjectives:
        if 'conjugation_type' in adj:
            if adj['conjugation_type'] == 'i_adjective':
                i_adjectives += 1
            elif adj['conjugation_type'] == 'na_adjective':
                na_adjectives += 1
            elif adj['conjugation_type'] == 'i_adjective_irregular':
                irregular += 1
    
    print(f"I-adjectives: {i_adjectives}")
    print(f"Na-adjectives: {na_adjectives}")
    print(f"Irregular: {irregular}")
    print(f"Total with conjugations: {i_adjectives + na_adjectives + irregular}")
    print(f"Total adjectives: {len(adjectives)}")
    
    # Show a few examples
    print("\n=== EXAMPLE CONJUGATIONS ===")
    for adj in adjectives[:3]:
        if 'conjugations' in adj:
            print(f"\n{adj['english']} ({adj['conjugation_type']}):")
            for form, data in adj['conjugations'].items():
                print(f"  {form}: {data['hiragana']} ({data['romaji']})")

if __name__ == "__main__":
    input_file = "datum/adjectives.json"
    
    # Create backup
    backup_file = "datum/adjectives.json.backup"
    print(f"Creating backup: {backup_file}")
    
    import shutil
    shutil.copy2(input_file, backup_file)
    
    # Enhance adjectives
    enhanced_adjectives = enhance_adjectives(input_file)
    
    # Verify results
    verify_conjugations(enhanced_adjectives)
    
    print(f"\n✅ All done! Backup saved to {backup_file}")
    print("You can now test the enhanced adjectives.json file.")
