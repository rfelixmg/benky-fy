#!/usr/bin/env python3
"""
Test script to verify conjugation integration is working properly.
This tests the backend conjugation functionality without requiring the full Flask app.
"""

import sys
import os
sys.path.append('.')

from app.v1.conjugation import create_conjugation_checker
from app.v1.flashcard.engines.verb import VerbFlashcardEngine
from app.v1.flashcard.engines.adjective import AdjectiveFlashcardEngine

def test_conjugation_integration():
    """Test the conjugation integration end-to-end"""
    print("Testing conjugation integration...")
    
    # Initialize engines
    verb_engine = VerbFlashcardEngine('./datum/verbs.json')
    adj_engine = AdjectiveFlashcardEngine('./datum/adjectives.json')
    
    # Initialize checker
    checker = create_conjugation_checker()
    
    print(f"Loaded {len(verb_engine._data)} verbs and {len(adj_engine._data)} adjectives")
    
    # Test verb conjugation
    if verb_engine._data:
        item = verb_engine._data[0]  # First verb
        print(f"\nTesting verb: {item.kanji} ({item.hiragana}) - {item.english}")
        print(f"Grammatical type: {getattr(item, 'grammatical_type', 'unknown')}")
        print(f"Available conjugations: {list(item.conjugations.keys()) if item.conjugations else 'None'}")
        
        # Test different conjugation forms
        test_cases = [
            ('polite', 'します'),
            ('negative', 'しない'),
            ('past', 'した')
        ]
        
        for form, expected_answer in test_cases:
            if item.conjugations and form in item.conjugations:
                item_dict = {
                    'kanji': item.kanji,
                    'hiragana': item.hiragana,
                    'english': item.english,
                    'conjugations': item.conjugations,
                    'grammatical_type': getattr(item, 'grammatical_type', 'verb')
                }
                
                result = checker.check_answer(expected_answer, item_dict, form, 'irregular')
                status = "✅ PASS" if result.is_correct else "❌ FAIL"
                print(f"  {form}: {status} - {result.feedback}")
            else:
                print(f"  {form}: ⚠️  SKIP - Form not available")
    
    # Test adjective conjugation
    if adj_engine._data:
        item = adj_engine._data[0]  # First adjective
        print(f"\nTesting adjective: {item.kanji} ({item.hiragana}) - {item.english}")
        print(f"Conjugation type: {getattr(item, 'conjugation_type', 'unknown')}")
        print(f"Available conjugations: {list(item.conjugations.keys()) if item.conjugations else 'None'}")
        
        # Test different conjugation forms
        test_cases = [
            ('present', 'たいへん'),
            ('past', 'たいへんだった'),
            ('negative', 'たいへんではない')
        ]
        
        for form, expected_answer in test_cases:
            if item.conjugations and form in item.conjugations:
                item_dict = {
                    'kanji': item.kanji,
                    'hiragana': item.hiragana,
                    'english': item.english,
                    'conjugations': item.conjugations,
                    'conjugation_type': getattr(item, 'conjugation_type', 'i_adjective')
                }
                
                result = checker.check_answer(expected_answer, item_dict, form, 'na_adjective')
                status = "✅ PASS" if result.is_correct else "❌ FAIL"
                print(f"  {form}: {status} - {result.feedback}")
            else:
                print(f"  {form}: ⚠️  SKIP - Form not available")
    
    print("\n✅ Conjugation integration test completed!")

if __name__ == "__main__":
    test_conjugation_integration()
