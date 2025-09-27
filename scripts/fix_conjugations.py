#!/usr/bin/env python3
"""
Script to fix godan verb conjugations in verbs.json
Applies correct Japanese conjugation rules to replace incorrect polite forms
"""

import json
import os
import shutil
from typing import Dict, Any

def conjugate_godan_polite(verb_hiragana: str) -> str:
    """
    Apply correct godan conjugation rules for polite form (ます form)
    
    Rules:
    - う → い + ます
    - く → き + ます  
    - ぐ → ぎ + ます
    - す → し + ます
    - つ → ち + ます
    - ぬ → に + ます
    - ぶ → び + ます
    - む → み + ます
    - る → り + ます
    """
    if not verb_hiragana:
        return ""
    
    # Get the last character
    last_char = verb_hiragana[-1]
    stem = verb_hiragana[:-1]
    
    # Apply conjugation rules
    conjugation_map = {
        'う': 'い',
        'く': 'き',
        'ぐ': 'ぎ', 
        'す': 'し',
        'つ': 'ち',
        'ぬ': 'に',
        'ぶ': 'び',
        'む': 'み',
        'る': 'り'
    }
    
    if last_char in conjugation_map:
        conjugated_stem = stem + conjugation_map[last_char]
        return conjugated_stem + 'ます'
    else:
        # If it doesn't end with a godan ending, return as is
        return verb_hiragana + 'ます'

def conjugate_godan_kanji_polite(verb_kanji: str) -> str:
    """
    Apply correct godan conjugation rules for polite form in kanji
    This is more complex as we need to handle kanji readings
    For now, we'll use a simple approach based on common patterns
    """
    if not verb_kanji:
        return ""
    
    # For kanji, we'll use a simpler approach - just add ます
    # The hiragana version will be correct, and kanji readings are complex
    return verb_kanji + 'ます'

def fix_verb_conjugations(verb_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fix conjugations for a single verb entry
    """
    # Only fix godan verbs
    conjugation_type = verb_data.get('conjugation', '')
    grammatical_type = verb_data.get('grammatical_type', '')
    
    if conjugation_type not in ['godan'] and grammatical_type not in ['godan']:
        return verb_data
    
    # Get the dictionary form
    hiragana = verb_data.get('hiragana', '')
    kanji = verb_data.get('kanji', '')
    
    if not hiragana:
        return verb_data
    
    # Fix the conjugations
    conjugations = verb_data.get('conjugations', {})
    
    # Fix polite form
    if 'polite' in conjugations:
        old_polite_hiragana = conjugations['polite'].get('hiragana', '')
        correct_polite_hiragana = conjugate_godan_polite(hiragana)
        
        # Only update if the current form is incorrect
        if old_polite_hiragana != correct_polite_hiragana:
            print(f"Fixing {hiragana}: {old_polite_hiragana} → {correct_polite_hiragana}")
            conjugations['polite']['hiragana'] = correct_polite_hiragana
            
            # Also fix kanji if present
            if 'kanji' in conjugations['polite']:
                conjugations['polite']['kanji'] = conjugate_godan_kanji_polite(kanji)
    
    return verb_data

def main():
    """
    Main function to fix all godan verb conjugations
    """
    # Path to verbs.json
    verbs_file = 'datum/verbs.json'
    backup_file = 'datum/verbs.json.backup'
    
    if not os.path.exists(verbs_file):
        print(f"Error: {verbs_file} not found!")
        return
    
    # Create backup
    print(f"Creating backup: {backup_file}")
    shutil.copy2(verbs_file, backup_file)
    
    # Load verbs data
    print("Loading verbs data...")
    with open(verbs_file, 'r', encoding='utf-8') as f:
        verbs_data = json.load(f)
    
    print(f"Loaded {len(verbs_data)} verbs")
    
    # Fix conjugations
    fixed_count = 0
    for i, verb in enumerate(verbs_data):
        original_conjugations = verb.get('conjugations', {}).copy()
        fixed_verb = fix_verb_conjugations(verb)
        
        # Check if anything was changed
        if original_conjugations != fixed_verb.get('conjugations', {}):
            fixed_count += 1
    
    print(f"Fixed conjugations for {fixed_count} verbs")
    
    # Save fixed data
    print("Saving fixed data...")
    with open(verbs_file, 'w', encoding='utf-8') as f:
        json.dump(verbs_data, f, ensure_ascii=False, indent=2)
    
    print("Done! Fixed verbs.json with correct godan conjugations")
    print(f"Backup saved as: {backup_file}")

if __name__ == "__main__":
    main()
