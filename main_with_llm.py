#!/usr/bin/env python3
"""Main entry point with enhanced LLM integration - similar to original but better."""

import argparse
import json
from typing import List, Optional
from sentence_generator import SentenceGenerator
from robust_llm_integration import RobustLocalLLM
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Japanese Sentence Generator with Enhanced LLM Integration")
    
    # Basic generation options
    parser.add_argument("--count", type=int, default=5, help="Number of sentences to generate")
    parser.add_argument("--theme", type=str, help="Specific theme to use")
    parser.add_argument("--list-themes", action="store_true", help="List available themes")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    parser.add_argument("--coherent-only", action="store_true", help="Only show coherent sentences")
    
    # LLM options
    parser.add_argument("--enhance", action="store_true", help="Use LLM to enhance sentences")
    parser.add_argument("--target-level", type=str, default="beginner", 
                       choices=["beginner", "intermediate", "advanced"],
                       help="Target learning level")
    
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
    
    # Initialize LLM if enhancement is requested
    llm = None
    if args.enhance:
        llm = setup_local_llm()
        if not llm:
            print("❌ LLM setup failed. Running without enhancement.")
            args.enhance = False
    
    # Generate sentences
    sentences = []
    for i in range(args.count):
        sentence = generator.generate_sentence(args.theme, args.debug)
        sentences.append(sentence)
    
    # Filter coherent sentences if requested
    if args.coherent_only:
        sentences = [s for s in sentences if s.coherence_passed]
    
    # Display results
    if args.enhance and llm:
        display_enhanced_sentences(sentences, llm, args)
    else:
        display_basic_sentences(sentences, args)

def setup_local_llm():
    """Setup local LLM"""
    try:
        project_root = Path(__file__).parent
        models_dir = project_root / "models"
        llama_cli_path = models_dir / "llama.cpp" / "build" / "bin" / "llama-cli"
        model_path = models_dir / "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
        
        if not llama_cli_path.exists() or not model_path.exists():
            print("❌ LLM files not found. Please run setup first.")
            return None
        
        return RobustLocalLLM(str(model_path), str(llama_cli_path))
    except Exception as e:
        print(f"❌ LLM setup error: {e}")
        return None

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

def display_enhanced_sentences(sentences: List, llm: RobustLocalLLM, args):
    """Display LLM-enhanced sentences with detailed analysis"""
    print("🎌 Enhanced Japanese Sentence Generation with LLM Analysis")
    print("=" * 70)
    
    for i, sentence in enumerate(sentences, 1):
        print(f"\n{'='*70}")
        print(f"SENTENCE #{i}")
        print(f"{'='*70}")
        
        try:
            # Generate enhanced analysis
            enhanced_output = llm.generate_enhanced_sentence(sentence.theme, args.target_level)
            
            # Display in the enhanced format
            display_single_enhanced_sentence(enhanced_output, i)
            
        except Exception as e:
            print(f"❌ Error enhancing sentence {i}: {e}")
            # Fallback to basic display
            print(f"Structure: {sentence.structure}")
            print(f"Theme: {sentence.theme}")
            print(f"Japanese: {sentence.japanese}")
            print(f"English: {sentence.english}")
            print(f"Coherent: {'Yes' if sentence.coherence_passed else 'No'}")

def display_single_enhanced_sentence(output: dict, sentence_num: int):
    """Display a single enhanced sentence with full analysis"""
    
    # Original sentence
    orig = output["original_sentence"]
    print(f"\n📝 ORIGINAL SENTENCE:")
    print(f"   Japanese: {orig['japanese']}")
    print(f"   English: {orig['english']}")
    print(f"   Structure: {orig['structure']}")
    print(f"   Theme: {orig['theme']}")
    print(f"   Coherent: {'✅ Yes' if orig['coherent'] else '❌ No'}")
    if orig['coherence_issues']:
        for issue in orig['coherence_issues']:
            print(f"   Issue: {issue}")
    
    # Enhanced sentence
    enh = output["enhanced_sentence"]
    print(f"\n✨ ENHANCED SENTENCE:")
    print(f"   Japanese: {enh['japanese']}")
    print(f"   English: {enh['english']}")
    print(f"   Difficulty: {enh['difficulty_level']}/5")
    
    # Grammar analysis
    grammar = output["grammar_analysis"]
    print(f"\n📚 GRAMMAR ANALYSIS:")
    if grammar["structure_explanation"] and grammar["structure_explanation"] != "Not available":
        print(f"   Structure: {grammar['structure_explanation']}")
    if grammar["particles_explanation"] and grammar["particles_explanation"] != "Not available":
        print(f"   Particles: {grammar['particles_explanation']}")
    if grammar["grammar_points"] and grammar["grammar_points"] != "Not available":
        print(f"   Key Points: {grammar['grammar_points']}")
    
    # Word breakdown
    if output["word_breakdown"]:
        print(f"\n🔍 WORD-BY-WORD BREAKDOWN:")
        for word in output["word_breakdown"]:
            if word['word'] and word['word'] != '[meaning]':
                print(f"   {word['word']} ({word['reading']}) - {word['meaning']}")
                print(f"     Part of speech: {word['part_of_speech']}")
                print(f"     Grammar: {word['grammar_notes']}")
    
    # Learning notes
    notes = output["learning_notes"]
    print(f"\n💡 LEARNING NOTES:")
    if notes["key_concepts"] and notes["key_concepts"] != "Not available":
        print(f"   Key Concepts: {notes['key_concepts']}")
    if notes["common_mistakes"] and notes["common_mistakes"] != "Not available":
        print(f"   Common Mistakes: {notes['common_mistakes']}")
    if notes["cultural_context"] and notes["cultural_context"] != "Not available":
        print(f"   Cultural Context: {notes['cultural_context']}")
    
    # Alternative expressions
    if output["alternative_expressions"] and output["alternative_expressions"] != "Not available":
        print(f"\n🔄 ALTERNATIVE EXPRESSIONS:")
        print(f"   {output['alternative_expressions']}")
    
    print(f"\n🤖 LLM Status: {output['llm_status']}")

if __name__ == "__main__":
    main()
