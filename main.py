#!/usr/bin/env python3
"""Main entry point for the Japanese Sentence Generator with LLM Integration."""

import argparse
import json
from typing import List, Optional
from sentence_generator import (
    SentenceGenerator, 
    UnifiedLLMManager, 
    setup_llm_manager, 
    create_default_config
)

def main():
    parser = argparse.ArgumentParser(description="Japanese Sentence Generator with LLM Integration")
    
    # Basic generation options
    parser.add_argument("--count", type=int, default=5, help="Number of sentences to generate")
    parser.add_argument("--theme", type=str, help="Specific theme to use")
    parser.add_argument("--list-themes", action="store_true", help="List available themes")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    parser.add_argument("--coherent-only", action="store_true", help="Only show coherent sentences")
    
    # LLM options
    parser.add_argument("--llm", type=str, help="LLM instance to use for enhancement")
    parser.add_argument("--target-level", type=str, default="beginner", 
                       choices=["beginner", "intermediate", "advanced"],
                       help="Target learning level")
    parser.add_argument("--enhance", action="store_true", help="Use LLM to enhance sentences")
    parser.add_argument("--compare-llms", nargs="+", help="Compare outputs from multiple LLMs")
    
    # Data options
    parser.add_argument("--data-dir", type=str, default="tmp", help="Data directory path")
    
    args = parser.parse_args()
    
    # Initialize sentence generator
    generator = SentenceGenerator(args.data_dir)
    
    # List themes if requested
    if args.list_themes:
        themes = list(generator.rules.keys())
        print("Available themes:")
        for theme in themes:
            print(f"  - {theme}")
        return
    
    # Generate sentences
    sentences = []
    for i in range(args.count):
        sentence = generator.generate_sentence(args.theme, args.debug)
        sentences.append(sentence)
    
    # Filter coherent sentences if requested
    if args.coherent_only:
        sentences = [s for s in sentences if s.coherence_passed]
    
    # Display results
    if args.enhance and args.llm:
        display_enhanced_sentences(sentences, args)
    elif args.compare_llms:
        compare_llm_outputs(sentences, args)
    else:
        display_basic_sentences(sentences, args)

def display_basic_sentences(sentences: List, args):
    """Display basic sentence generation results"""
    print("Japanese Sentence Generation Examples:")
    print("=" * 50)
    
    for i, sentence in enumerate(sentences, 1):
        print(f"\n{'='*60}")
        print(f"Structure: {sentence.structure}")
        print(f"Theme: {sentence.theme}")
        print(f"\nComponents:")
        for slot, component in sentence.components.items():
            if isinstance(component, dict):
                english = component.get("english", "[NOT FOUND]")
                hiragana = component.get("hiragana", "[NOT FOUND]")
                print(f"  {slot}: {english} | {hiragana}")
        
        print(f"\nJapanese: {sentence.japanese}")
        print(f"English: {sentence.english}")
        
        print(f"\nChecks:")
        if sentence.coherence_passed:
            print(f"  Coherence: ✓ PASS")
            print(f"  No issues detected")
        else:
            print(f"  Coherence: ✗ FAIL")
            for issue in sentence.coherence_issues:
                print(f"  Issue: {issue}")
        
        if args.debug and sentence.debug_info:
            print(f"\nDebug Info:")
            print(f"  Relationship: {sentence.debug_info.get('relationship', 'N/A')}")
            if 'semantic_scores' in sentence.debug_info:
                for slot, scores in sentence.debug_info['semantic_scores'].items():
                    print(f"  {slot}: overall={scores['overall']:.2f}")

def display_enhanced_sentences(sentences: List, args):
    """Display LLM-enhanced sentences"""
    # Setup LLM manager
    config = create_default_config()
    manager = setup_llm_manager(config)
    
    print("LLM-Enhanced Japanese Sentence Generation:")
    print("=" * 50)
    
    for i, sentence in enumerate(sentences, 1):
        print(f"\n{'='*60}")
        print(f"SEED SENTENCE:")
        print(f"  Japanese: {sentence.japanese}")
        print(f"  English: {sentence.english}")
        print(f"  Theme: {sentence.theme}")
        print(f"  Structure: {sentence.structure}")
        
        try:
            # Generate enhanced sentence
            enhanced = manager.generate_enhanced_sentence(
                args.llm, 
                sentence.theme, 
                args.target_level
            )
            
            print(f"\nENHANCED SENTENCE:")
            print(f"  Japanese: {enhanced['enhanced_japanese']}")
            print(f"  English: {enhanced['enhanced_english']}")
            
            if enhanced['grammar_notes']:
                print(f"\nGrammar Notes:")
                print(f"  {enhanced['grammar_notes']}")
            
            if enhanced['cultural_notes']:
                print(f"\nCultural Notes:")
                print(f"  {enhanced['cultural_notes']}")
            
            if enhanced['difficulty_level']:
                print(f"\nDifficulty Level: {enhanced['difficulty_level']}/5")
            
            if enhanced['alternative_translations']:
                print(f"\nAlternative Translations:")
                for alt in enhanced['alternative_translations']:
                    print(f"  - {alt}")
            
            print(f"\nWord-by-Word Analysis:")
            for word_data in enhanced['word_analysis']['words']:
                print(f"  {word_data['word']} ({word_data['reading']}) - {word_data['meaning']} [{word_data['word_type']}]")
            
        except Exception as e:
            print(f"\nError enhancing sentence: {e}")

def compare_llm_outputs(sentences: List, args):
    """Compare outputs from multiple LLMs"""
    config = create_default_config()
    manager = setup_llm_manager(config)
    
    print("LLM Comparison:")
    print("=" * 50)
    
    # Take first sentence for comparison
    if not sentences:
        print("No sentences to compare")
        return
    
    sentence = sentences[0]
    print(f"Seed Sentence: {sentence.japanese} ({sentence.english})")
    
    try:
        results = manager.compare_llm_outputs(
            args.compare_llms, 
            sentence.theme, 
            args.target_level
        )
        
        for llm_name, result in results.items():
            print(f"\n{'='*40}")
            print(f"LLM: {llm_name}")
            
            if "error" in result:
                print(f"Error: {result['error']}")
                continue
            
            print(f"Japanese: {result['enhanced_japanese']}")
            print(f"English: {result['enhanced_english']}")
            
            if result['grammar_notes']:
                print(f"Grammar: {result['grammar_notes'][:100]}...")
            
            if result['difficulty_level']:
                print(f"Difficulty: {result['difficulty_level']}/5")
    
    except Exception as e:
        print(f"Error comparing LLMs: {e}")

if __name__ == "__main__":
    main()
