#!/usr/bin/env python3
"""Robust LLM integration that works well with smaller models like TinyLlama."""

import subprocess
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from sentence_generator import SentenceGenerator

class RobustLocalLLM:
    """Robust local LLM that produces structured output even with smaller models"""
    
    def __init__(self, model_path: str, executable_path: str):
        self.model_path = model_path
        self.executable_path = executable_path
        self.sentence_generator = SentenceGenerator("tmp")
    
    def generate_enhanced_sentence(self, theme: Optional[str] = None, target_level: str = "beginner") -> Dict[str, Any]:
        """Generate an enhanced sentence with detailed analysis"""
        
        # Generate base sentence
        base_sentence = self.sentence_generator.generate_sentence(theme, debug=True)
        
        # Create multiple focused prompts for better results
        enhanced_japanese = self._get_enhanced_japanese(base_sentence)
        grammar_analysis = self._get_grammar_analysis(base_sentence)
        word_breakdown = self._get_word_breakdown(base_sentence)
        learning_notes = self._get_learning_notes(base_sentence)
        
        # Combine into structured output
        enhanced_output = {
            "original_sentence": {
                "japanese": base_sentence.japanese,
                "english": base_sentence.english,
                "structure": base_sentence.structure,
                "theme": base_sentence.theme,
                "coherent": base_sentence.coherence_passed,
                "coherence_issues": base_sentence.coherence_issues
            },
            "enhanced_sentence": {
                "japanese": enhanced_japanese["japanese"],
                "english": enhanced_japanese["english"],
                "difficulty_level": enhanced_japanese["difficulty"]
            },
            "grammar_analysis": grammar_analysis,
            "word_breakdown": word_breakdown,
            "learning_notes": learning_notes,
            "alternative_expressions": self._get_alternatives(base_sentence),
            "llm_status": "success"
        }
        
        return enhanced_output
    
    def _get_enhanced_japanese(self, sentence) -> Dict[str, str]:
        """Get enhanced Japanese sentence"""
        prompt = f"""Improve this Japanese sentence to make it more natural:

Original: {sentence.japanese} ({sentence.english})

Provide a better version in this format:
Japanese: [improved sentence]
English: [natural translation]
Difficulty: [1-5]"""
        
        response = self._call_llm(prompt)
        
        # Parse response
        japanese_match = re.search(r'Japanese:\s*(.+)', response)
        english_match = re.search(r'English:\s*(.+)', response)
        difficulty_match = re.search(r'Difficulty:\s*(\d+)', response)
        
        return {
            "japanese": japanese_match.group(1).strip() if japanese_match else sentence.japanese,
            "english": english_match.group(1).strip() if english_match else sentence.english,
            "difficulty": int(difficulty_match.group(1)) if difficulty_match else 3
        }
    
    def _get_grammar_analysis(self, sentence) -> Dict[str, str]:
        """Get grammar analysis"""
        prompt = f"""Explain the grammar of this Japanese sentence:

{sentence.japanese} ({sentence.english})
Structure: {sentence.structure}

Explain:
1. Sentence structure
2. Particles used
3. Key grammar points"""
        
        response = self._call_llm(prompt)
        
        return {
            "structure_explanation": self._extract_first_paragraph(response),
            "particles_explanation": self._extract_second_paragraph(response),
            "grammar_points": self._extract_third_paragraph(response)
        }
    
    def _get_word_breakdown(self, sentence) -> List[Dict[str, str]]:
        """Get word-by-word breakdown"""
        prompt = f"""Break down this Japanese sentence word by word:

{sentence.japanese}

For each word, provide:
- Japanese word
- Reading (hiragana)
- English meaning
- Part of speech"""
        
        response = self._call_llm(prompt)
        
        # Parse word breakdown
        words = []
        lines = response.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 5:
                continue
                
            # Try to extract word information
            parts = line.split()
            if len(parts) >= 2:
                word = parts[0]
                reading = parts[1] if len(parts) > 1 else "[reading]"
                meaning = " ".join(parts[2:]) if len(parts) > 2 else "[meaning]"
                
                words.append({
                    "word": word,
                    "reading": reading,
                    "meaning": meaning,
                    "part_of_speech": self._guess_part_of_speech(word),
                    "grammar_notes": self._get_grammar_notes(word, sentence.structure)
                })
        
        return words[:5]  # Limit to 5 words to avoid clutter
    
    def _get_learning_notes(self, sentence) -> Dict[str, str]:
        """Get learning notes"""
        prompt = f"""Provide learning notes for this Japanese sentence:

{sentence.japanese} ({sentence.english})

Include:
1. Key concepts to learn
2. Common mistakes
3. Cultural context"""
        
        response = self._call_llm(prompt)
        
        return {
            "key_concepts": self._extract_first_paragraph(response),
            "common_mistakes": self._extract_second_paragraph(response),
            "cultural_context": self._extract_third_paragraph(response)
        }
    
    def _get_alternatives(self, sentence) -> str:
        """Get alternative expressions"""
        prompt = f"""Provide alternative ways to express this idea:

{sentence.japanese} ({sentence.english})

Give 2-3 alternative expressions."""
        
        response = self._call_llm(prompt)
        return response.strip()
    
    def _call_llm(self, prompt: str) -> str:
        """Call the local LLM with the prompt"""
        
        cmd = [
            self.executable_path,
            "-m", self.model_path,
            "-p", prompt,
            "-n", "100",  # Shorter responses work better
            "--temp", "0.7",
            "--top-p", "0.9",
            "--no-conversation"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                # Clean up the response
                response = result.stdout.strip()
                # Remove the prompt from the response
                if prompt in response:
                    response = response.replace(prompt, "").strip()
                return response
            else:
                return f"Error: {result.stderr}"
                
        except Exception as e:
            return f"Exception: {e}"
    
    def _extract_first_paragraph(self, text: str) -> str:
        """Extract the first paragraph from text"""
        paragraphs = text.split('\n\n')
        return paragraphs[0].strip() if paragraphs else text[:100] + "..."
    
    def _extract_second_paragraph(self, text: str) -> str:
        """Extract the second paragraph from text"""
        paragraphs = text.split('\n\n')
        return paragraphs[1].strip() if len(paragraphs) > 1 else "Not available"
    
    def _extract_third_paragraph(self, text: str) -> str:
        """Extract the third paragraph from text"""
        paragraphs = text.split('\n\n')
        return paragraphs[2].strip() if len(paragraphs) > 2 else "Not available"
    
    def _guess_part_of_speech(self, word: str) -> str:
        """Guess part of speech based on word patterns"""
        if word in ['は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで', 'へ', 'の', 'も', 'か']:
            return "particle"
        elif word.endswith('です') or word.endswith('だ'):
            return "verb (copula)"
        elif word.endswith('い') or word.endswith('な'):
            return "adjective"
        elif word.endswith('る') or word.endswith('う') or word.endswith('く'):
            return "verb"
        else:
            return "noun"
    
    def _get_grammar_notes(self, word: str, structure: str) -> str:
        """Get grammar notes for a word based on sentence structure"""
        if word in ['は', 'が']:
            return "Topic/subject particle"
        elif word in ['を']:
            return "Direct object particle"
        elif word in ['に']:
            return "Direction/time particle"
        elif word in ['で']:
            return "Location/method particle"
        elif word in ['の']:
            return "Possessive particle"
        elif word == 'です':
            return "Polite copula verb"
        else:
            return "Main content word"
    
    def display_enhanced_output(self, output: Dict[str, Any]):
        """Display the enhanced output in a formatted way"""
        
        print("🎌 Enhanced Japanese Sentence Analysis")
        print("=" * 60)
        
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
        if grammar["structure_explanation"]:
            print(f"   Structure: {grammar['structure_explanation']}")
        if grammar["particles_explanation"]:
            print(f"   Particles: {grammar['particles_explanation']}")
        if grammar["grammar_points"]:
            print(f"   Key Points: {grammar['grammar_points']}")
        
        # Word breakdown
        if output["word_breakdown"]:
            print(f"\n🔍 WORD-BY-WORD BREAKDOWN:")
            for word in output["word_breakdown"]:
                print(f"   {word['word']} ({word['reading']}) - {word['meaning']}")
                print(f"     Part of speech: {word['part_of_speech']}")
                print(f"     Grammar: {word['grammar_notes']}")
        
        # Learning notes
        notes = output["learning_notes"]
        print(f"\n💡 LEARNING NOTES:")
        if notes["key_concepts"]:
            print(f"   Key Concepts: {notes['key_concepts']}")
        if notes["common_mistakes"]:
            print(f"   Common Mistakes: {notes['common_mistakes']}")
        if notes["cultural_context"]:
            print(f"   Cultural Context: {notes['cultural_context']}")
        
        # Alternative expressions
        if output["alternative_expressions"]:
            print(f"\n🔄 ALTERNATIVE EXPRESSIONS:")
            print(f"   {output['alternative_expressions']}")
        
        print(f"\n🤖 LLM Status: {output['llm_status']}")

def main():
    """Test the robust LLM integration"""
    
    # Setup paths
    project_root = Path(__file__).parent
    models_dir = project_root / "models"
    llama_cli_path = models_dir / "llama.cpp" / "build" / "bin" / "llama-cli"
    model_path = models_dir / "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    
    # Create robust LLM
    llm = RobustLocalLLM(str(model_path), str(llama_cli_path))
    
    print("🚀 Testing Robust LLM Integration")
    print("=" * 50)
    
    # Generate enhanced sentence
    try:
        output = llm.generate_enhanced_sentence("identity", "beginner")
        llm.display_enhanced_output(output)
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
