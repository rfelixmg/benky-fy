#!/usr/bin/env python3
"""
Analyze adjectives.json to categorize i-adjectives vs na-adjectives
and identify special cases for conjugation planning.
"""

import json
import re
from typing import List, Dict, Any

def load_adjectives(filename: str) -> List[Dict[str, Any]]:
    """Load adjectives from JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def categorize_adjective(adj: Dict[str, Any]) -> str:
    """Categorize adjective as i-adjective, na-adjective, or special case"""
    hiragana = adj.get('hiragana', '')
    kanji = adj.get('kanji', '')
    
    # Special cases that end in い but are na-adjectives
    special_na_adjectives = {
        'きれい', 'ゆうめい', 'きらい', 'すき', 'きらい', 'へん', 'べんり'
    }
    
    # Check if it's a special case
    if hiragana in special_na_adjectives or kanji in special_na_adjectives:
        return 'na_adjective_special'
    
    # Check if it ends in い (hiragana)
    if hiragana.endswith('い'):
        return 'i_adjective'
    
    # Everything else is na-adjective
    return 'na_adjective'

def analyze_adjectives(filename: str):
    """Analyze all adjectives and categorize them"""
    adjectives = load_adjectives(filename)
    
    categories = {
        'i_adjective': [],
        'na_adjective': [],
        'na_adjective_special': []
    }
    
    for adj in adjectives:
        category = categorize_adjective(adj)
        categories[category].append({
            'english': adj.get('english', ''),
            'kanji': adj.get('kanji', ''),
            'hiragana': adj.get('hiragana', ''),
            'romaji': adj.get('romaji', '')
        })
    
    return categories

def print_analysis(categories: Dict[str, List[Dict]]):
    """Print analysis results"""
    print("=== ADJECTIVES CONJUGATION ANALYSIS ===\n")
    
    for category, items in categories.items():
        print(f"## {category.upper().replace('_', ' ')} ({len(items)} items)")
        print("-" * 50)
        
        for item in items:
            print(f"• {item['english']}")
            print(f"  Kanji: {item['kanji']}")
            print(f"  Hiragana: {item['hiragana']}")
            print(f"  Romaji: {item['romaji']}")
            print()
        
        print()

def generate_conjugation_schema(categories: Dict[str, List[Dict]]):
    """Generate example conjugation schemas for each type"""
    print("=== CONJUGATION SCHEMA EXAMPLES ===\n")
    
    # I-adjective example
    if categories['i_adjective']:
        example = categories['i_adjective'][0]
        print("## I-Adjective Example:")
        print(f"Base: {example['hiragana']} ({example['english']})")
        print("```json")
        print(f'''{{
  "conjugation_type": "i_adjective",
  "conjugations": {{
    "present": {{"kanji": "{example['kanji']}", "hiragana": "{example['hiragana']}", "romaji": "{example['romaji']}"}},
    "past": {{"kanji": "{example['kanji'][:-1]}かった", "hiragana": "{example['hiragana'][:-1]}かった", "romaji": "{example['romaji'][:-1]}katta"}},
    "negative": {{"kanji": "{example['kanji'][:-1]}くない", "hiragana": "{example['hiragana'][:-1]}くない", "romaji": "{example['romaji'][:-1]}kunai"}},
    "negative_past": {{"kanji": "{example['kanji'][:-1]}くなかった", "hiragana": "{example['hiragana'][:-1]}くなかった", "romaji": "{example['romaji'][:-1]}kunakatta"}},
    "adverbial": {{"kanji": "{example['kanji'][:-1]}く", "hiragana": "{example['hiragana'][:-1]}く", "romaji": "{example['romaji'][:-1]}ku"}}
  }}
}}''')
        print("```\n")
    
    # Na-adjective example
    if categories['na_adjective']:
        example = categories['na_adjective'][0]
        print("## Na-Adjective Example:")
        print(f"Base: {example['hiragana']} ({example['english']})")
        print("```json")
        print(f'''{{
  "conjugation_type": "na_adjective",
  "conjugations": {{
    "present": {{"kanji": "{example['kanji']}", "hiragana": "{example['hiragana']}", "romaji": "{example['romaji']}"}},
    "past": {{"kanji": "{example['kanji']}だった", "hiragana": "{example['hiragana']}だった", "romaji": "{example['romaji']} datta"}},
    "negative": {{"kanji": "{example['kanji']}ではない", "hiragana": "{example['hiragana']}ではない", "romaji": "{example['romaji']} dewa nai"}},
    "negative_past": {{"kanji": "{example['kanji']}ではなかった", "hiragana": "{example['hiragana']}ではなかった", "romaji": "{example['romaji']} dewa nakatta"}},
    "adverbial": {{"kanji": "{example['kanji']}に", "hiragana": "{example['hiragana']}に", "romaji": "{example['romaji']} ni"}}
  }}
}}''')
        print("```\n")

if __name__ == "__main__":
    filename = "datum/adjectives.json"
    categories = analyze_adjectives(filename)
    print_analysis(categories)
    generate_conjugation_schema(categories)
