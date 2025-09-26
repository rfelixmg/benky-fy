#!/usr/bin/env python3
"""
Test the conjugation checker with real data from verbs.json and adjectives.json
"""

import json
import sys
import os

# Add the app directory to the path so we can import the checker
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'app'))

from conjugation_checker import create_conjugation_checker

def load_json_data(filename: str) -> list:
    """Load JSON data from file"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def test_verb_conjugations():
    """Test verb conjugation checking"""
    print("=== TESTING VERB CONJUGATIONS ===")
    
    verbs = load_json_data("datum/verbs.json")
    checker = create_conjugation_checker()
    
    test_cases = [
        # (verb_index, form, user_input, expected_correct)
        (0, "polite", "するます", True),  # する -> するます
        (2, "polite", "かんがえます", True),  # 考える -> かんがえます
        (2, "negative", "かんがえない", True),  # 考える -> かんがえない
        (2, "polite", "かんがえる", False),  # Wrong form
        (2, "negative", "かんがえます", False),  # Wrong form
    ]
    
    for verb_idx, form, user_input, expected in test_cases:
        if verb_idx >= len(verbs):
            print(f"⚠️  Verb index {verb_idx} out of range")
            continue
            
        verb = verbs[verb_idx]
        result = checker.check_answer(user_input, verb, form, "verb")
        
        status = "✅" if result.is_correct == expected else "❌"
        print(f"{status} {verb['english']} - {form}: '{user_input}' -> {result.is_correct}")
        if result.feedback:
            print(f"   Feedback: {result.feedback}")
    
    print()

def test_adjective_conjugations():
    """Test adjective conjugation checking"""
    print("=== TESTING ADJECTIVE CONJUGATIONS ===")
    
    adjectives = load_json_data("datum/adjectives.json")
    checker = create_conjugation_checker()
    
    test_cases = [
        # (adj_index, form, user_input, expected_correct)
        (1, "past", "たのしかった", True),  # 楽しい -> たのしかった
        (1, "negative", "たのしくない", True),  # 楽しい -> たのしくない
        (1, "adverbial", "たのしく", True),  # 楽しい -> たのしく
        (0, "past", "たいへんだった", True),  # 大変 -> たいへんだった
        (0, "negative", "たいへんではない", True),  # 大変 -> たいへんではない
        (1, "past", "たのしい", False),  # Wrong form
        (0, "past", "たいへん", False),  # Wrong form
    ]
    
    for adj_idx, form, user_input, expected in test_cases:
        if adj_idx >= len(adjectives):
            print(f"⚠️  Adjective index {adj_idx} out of range")
            continue
            
        adj = adjectives[adj_idx]
        conjugation_type = adj.get('conjugation_type', 'unknown')
        result = checker.check_answer(user_input, adj, form, conjugation_type)
        
        status = "✅" if result.is_correct == expected else "❌"
        print(f"{status} {adj['english']} - {form}: '{user_input}' -> {result.is_correct}")
        if result.feedback:
            print(f"   Feedback: {result.feedback}")
    
    print()

def test_irregular_cases():
    """Test irregular conjugation cases"""
    print("=== TESTING IRREGULAR CASES ===")
    
    adjectives = load_json_data("datum/adjectives.json")
    checker = create_conjugation_checker()
    
    # Find the irregular adjective (いい)
    irregular_adj = None
    for adj in adjectives:
        if adj.get('conjugation_type') == 'i_adjective_irregular':
            irregular_adj = adj
            break
    
    if not irregular_adj:
        print("❌ No irregular adjective found")
        return
    
    print(f"Testing irregular adjective: {irregular_adj['english']}")
    
    test_cases = [
        ("past", "よかった", True),  # いい -> よかった
        ("negative", "よくない", True),  # いい -> よくない
        ("adverbial", "よく", True),  # いい -> よく
        ("past", "いかった", False),  # Wrong - should be よかった
        ("negative", "いくない", False),  # Wrong - should be よくない
    ]
    
    for form, user_input, expected in test_cases:
        result = checker.check_answer(user_input, irregular_adj, form, "i_adjective_irregular")
        
        status = "✅" if result.is_correct == expected else "❌"
        print(f"{status} {form}: '{user_input}' -> {result.is_correct}")
        if result.feedback:
            print(f"   Feedback: {result.feedback}")
    
    print()

def test_available_forms():
    """Test getting available forms for items"""
    print("=== TESTING AVAILABLE FORMS ===")
    
    verbs = load_json_data("datum/verbs.json")
    adjectives = load_json_data("datum/adjectives.json")
    checker = create_conjugation_checker()
    
    # Test verb forms
    if verbs:
        verb = verbs[0]
        available_forms = checker.get_available_forms(verb)
        print(f"Verb '{verb['english']}' available forms: {available_forms}")
    
    # Test adjective forms
    if adjectives:
        adj = adjectives[0]
        available_forms = checker.get_available_forms(adj)
        print(f"Adjective '{adj['english']}' available forms: {available_forms}")
    
    print()

def test_form_validation():
    """Test form validation"""
    print("=== TESTING FORM VALIDATION ===")
    
    verbs = load_json_data("datum/verbs.json")
    adjectives = load_json_data("datum/adjectives.json")
    checker = create_conjugation_checker()
    
    # Test valid forms
    if verbs:
        verb = verbs[0]
        valid_forms = ["polite", "negative", "past"]
        invalid_forms = ["invalid_form", "nonexistent"]
        
        for form in valid_forms:
            is_valid = checker.validate_conjugation_form(form, verb)
            status = "✅" if is_valid else "❌"
            print(f"{status} Verb form '{form}': {is_valid}")
        
        for form in invalid_forms:
            is_valid = checker.validate_conjugation_form(form, verb)
            status = "✅" if not is_valid else "❌"  # Should be invalid
            print(f"{status} Invalid verb form '{form}': {is_valid}")
    
    print()

def main():
    """Run all tests"""
    print("🧪 TESTING CONJUGATION CHECKER\n")
    
    try:
        test_verb_conjugations()
        test_adjective_conjugations()
        test_irregular_cases()
        test_available_forms()
        test_form_validation()
        
        print("🎉 All tests completed!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
