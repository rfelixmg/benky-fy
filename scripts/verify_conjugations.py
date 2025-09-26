#!/usr/bin/env python3
"""
Verify the accuracy of generated conjugations in adjectives.json
"""

import json
from typing import Dict, Any, List

def load_adjectives(filename: str) -> List[Dict[str, Any]]:
    """Load adjectives from JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def verify_i_adjective_conjugations(adj: Dict[str, Any]) -> List[str]:
    """Verify i-adjective conjugations are correct"""
    errors = []
    hiragana = adj.get('hiragana', '')
    conjugations = adj.get('conjugations', {})
    
    if not hiragana.endswith('い'):
        errors.append(f"Expected i-adjective to end in い, got: {hiragana}")
        return errors
    
    # Get stem (remove final い)
    stem = hiragana[:-1]
    
    # Check past form
    expected_past = stem + "かった"
    actual_past = conjugations.get('past', {}).get('hiragana', '')
    if actual_past != expected_past:
        errors.append(f"Past form error: expected {expected_past}, got {actual_past}")
    
    # Check negative form
    expected_negative = stem + "くない"
    actual_negative = conjugations.get('negative', {}).get('hiragana', '')
    if actual_negative != expected_negative:
        errors.append(f"Negative form error: expected {expected_negative}, got {actual_negative}")
    
    # Check negative past form
    expected_negative_past = stem + "くなかった"
    actual_negative_past = conjugations.get('negative_past', {}).get('hiragana', '')
    if actual_negative_past != expected_negative_past:
        errors.append(f"Negative past form error: expected {expected_negative_past}, got {actual_negative_past}")
    
    # Check adverbial form
    expected_adverbial = stem + "く"
    actual_adverbial = conjugations.get('adverbial', {}).get('hiragana', '')
    if actual_adverbial != expected_adverbial:
        errors.append(f"Adverbial form error: expected {expected_adverbial}, got {actual_adverbial}")
    
    return errors

def verify_na_adjective_conjugations(adj: Dict[str, Any]) -> List[str]:
    """Verify na-adjective conjugations are correct"""
    errors = []
    hiragana = adj.get('hiragana', '')
    conjugations = adj.get('conjugations', {})
    
    # Check past form
    expected_past = hiragana + "だった"
    actual_past = conjugations.get('past', {}).get('hiragana', '')
    if actual_past != expected_past:
        errors.append(f"Past form error: expected {expected_past}, got {actual_past}")
    
    # Check negative form
    expected_negative = hiragana + "ではない"
    actual_negative = conjugations.get('negative', {}).get('hiragana', '')
    if actual_negative != expected_negative:
        errors.append(f"Negative form error: expected {expected_negative}, got {actual_negative}")
    
    # Check negative past form
    expected_negative_past = hiragana + "ではなかった"
    actual_negative_past = conjugations.get('negative_past', {}).get('hiragana', '')
    if actual_negative_past != expected_negative_past:
        errors.append(f"Negative past form error: expected {expected_negative_past}, got {actual_negative_past}")
    
    # Check adverbial form
    expected_adverbial = hiragana + "に"
    actual_adverbial = conjugations.get('adverbial', {}).get('hiragana', '')
    if actual_adverbial != expected_adverbial:
        errors.append(f"Adverbial form error: expected {expected_adverbial}, got {actual_adverbial}")
    
    return errors

def verify_irregular_conjugations(adj: Dict[str, Any]) -> List[str]:
    """Verify irregular adjective conjugations (いい)"""
    errors = []
    hiragana = adj.get('hiragana', '')
    conjugations = adj.get('conjugations', {})
    
    if hiragana != 'いい':
        errors.append(f"Expected irregular adjective to be いい, got: {hiragana}")
        return errors
    
    # Check specific irregular forms
    expected_forms = {
        'past': 'よかった',
        'negative': 'よくない',
        'negative_past': 'よくなかった',
        'adverbial': 'よく'
    }
    
    for form, expected in expected_forms.items():
        actual = conjugations.get(form, {}).get('hiragana', '')
        if actual != expected:
            errors.append(f"{form} form error: expected {expected}, got {actual}")
    
    return errors

def verify_all_conjugations(filename: str):
    """Verify all conjugations in the adjectives file"""
    adjectives = load_adjectives(filename)
    
    total_errors = 0
    total_adjectives = 0
    
    print("=== CONJUGATION VERIFICATION ===\n")
    
    for adj in adjectives:
        if 'conjugation_type' not in adj:
            continue
            
        total_adjectives += 1
        english = adj.get('english', 'unknown')
        conjugation_type = adj.get('conjugation_type', 'unknown')
        
        errors = []
        
        if conjugation_type == 'i_adjective':
            errors = verify_i_adjective_conjugations(adj)
        elif conjugation_type == 'na_adjective':
            errors = verify_na_adjective_conjugations(adj)
        elif conjugation_type == 'i_adjective_irregular':
            errors = verify_irregular_conjugations(adj)
        
        if errors:
            total_errors += len(errors)
            print(f"❌ {english} ({conjugation_type}):")
            for error in errors:
                print(f"   {error}")
            print()
        else:
            print(f"✅ {english} ({conjugation_type})")
    
    print(f"\n=== SUMMARY ===")
    print(f"Total adjectives verified: {total_adjectives}")
    print(f"Total errors found: {total_errors}")
    
    if total_errors == 0:
        print("🎉 All conjugations are correct!")
    else:
        print(f"⚠️  Found {total_errors} errors that need fixing")
    
    return total_errors == 0

if __name__ == "__main__":
    filename = "datum/adjectives.json"
    success = verify_all_conjugations(filename)
    exit(0 if success else 1)
