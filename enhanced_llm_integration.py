#!/usr/bin/env python3
"""Enhanced LLM integration with structured output similar to the original system."""

import subprocess
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from sentence_generator import SentenceGenerator

class EnhancedLocalLLM:
    """Enhanced local LLM that produces structured, educational output"""
    
    def __init__(self, model_path: str, executable_path: str):
        self.model_path = model_path
        self.executable_path = executable_path
        self.sentence_generator = SentenceGenerator("tmp")
    
    def generate_enhanced_sentence(self, theme: Optional[str] = None, target_level: str = "beginner") -> Dict[str, Any]:
        """Generate an enhanced sentence with detailed analysis"""
        
        # Generate base sentence
        base_sentence = self.sentence_generator.generate_sentence(theme, debug=True)
        
        # Create structured prompt for LLM
        prompt = self._create_structured_prompt(base_sentence, target_level)
        
        # Get LLM enhancement
        llm_response = self._call_llm(prompt)
        
        # Parse and structure the response
        enhanced_output = self._parse_llm_response(llm_response, base_sentence)
        
        return enhanced_output
    
    def _create_structured_prompt(self, sentence, target_level: str) -> str:
        """Create a structured prompt that produces educational output"""
        
        prompt = f"""You are a Japanese language expert. Analyze and improve this Japanese sentence:

ORIGINAL SENTENCE:
Japanese: {sentence.japanese}
English: {sentence.english}
Structure: {sentence.structure}
Theme: {sentence.theme}
Coherent: {'Yes' if sentence.coherence_passed else 'No'}

TASK: Provide a detailed analysis and improvement in this format:

=== ENHANCED SENTENCE ===
Japanese: [improved Japanese sentence]
English: [natural English translation]
Difficulty: [1-5 scale]

=== GRAMMAR ANALYSIS ===
Structure: [explanation of sentence structure]
Particles: [explanation of particles used]
Grammar Points: [key grammar concepts]

=== WORD-BY-WORD BREAKDOWN ===
[word] ([reading]) - [meaning] - [part of speech] - [grammar notes]

=== LEARNING NOTES ===
Key Concepts: [important learning points]
Common Mistakes: [what learners often get wrong]
Cultural Context: [cultural information if relevant]

=== ALTERNATIVE EXPRESSIONS ===
[Alternative ways to express the same idea]

Please provide a comprehensive analysis that helps Japanese learners understand this sentence."""
        
        return prompt
    
    def _call_llm(self, prompt: str) -> str:
        """Call the local LLM with the prompt"""
        
        cmd = [
            self.executable_path,
            "-m", self.model_path,
            "-p", prompt,
            "-n", "300",  # More tokens for detailed response
            "--temp", "0.7",
            "--top-p", "0.9",
            "--no-conversation"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return f"Error: {result.stderr}"
                
        except Exception as e:
            return f"Exception: {e}"
    
    def _parse_llm_response(self, response: str, base_sentence) -> Dict[str, Any]:
        """Parse the LLM response into structured format"""
        
        # Extract sections using regex
        enhanced_sentence = self._extract_section(response, "ENHANCED SENTENCE")
        grammar_analysis = self._extract_section(response, "GRAMMAR ANALYSIS")
        word_breakdown = self._extract_section(response, "WORD-BY-WORD BREAKDOWN")
        learning_notes = self._extract_section(response, "LEARNING NOTES")
        alternatives = self._extract_section(response, "ALTERNATIVE EXPRESSIONS")
        
        # Parse enhanced sentence details
        japanese_match = re.search(r'Japanese:\s*(.+)', enhanced_sentence)
        english_match = re.search(r'English:\s*(.+)', enhanced_sentence)
        difficulty_match = re.search(r'Difficulty:\s*(\d+)', enhanced_sentence)
        
        enhanced_japanese = japanese_match.group(1).strip() if japanese_match else base_sentence.japanese
        enhanced_english = english_match.group(1).strip() if english_match else base_sentence.english
        difficulty = int(difficulty_match.group(1)) if difficulty_match else 3
        
        # Parse word breakdown
        word_analysis = self._parse_word_breakdown(word_breakdown)
        
        return {
            "original_sentence": {
                "japanese": base_sentence.japanese,
                "english": base_sentence.english,
                "structure": base_sentence.structure,
                "theme": base_sentence.theme,
                "coherent": base_sentence.coherence_passed,
                "coherence_issues": base_sentence.coherence_issues
            },
            "enhanced_sentence": {
                "japanese": enhanced_japanese,
                "english": enhanced_english,
                "difficulty_level": difficulty
            },
            "grammar_analysis": {
                "structure_explanation": self._extract_field(grammar_analysis, "Structure"),
                "particles_explanation": self._extract_field(grammar_analysis, "Particles"),
                "grammar_points": self._extract_field(grammar_analysis, "Grammar Points")
            },
            "word_breakdown": word_analysis,
            "learning_notes": {
                "key_concepts": self._extract_field(learning_notes, "Key Concepts"),
                "common_mistakes": self._extract_field(learning_notes, "Common Mistakes"),
                "cultural_context": self._extract_field(learning_notes, "Cultural Context")
            },
            "alternative_expressions": alternatives.strip() if alternatives else "",
            "llm_status": "success" if "Error:" not in response else "error"
        }
    
    def _extract_section(self, text: str, section_name: str) -> str:
        """Extract a section from the LLM response"""
        pattern = rf"=== {section_name} ===(.*?)(?=== |$)"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        return match.group(1).strip() if match else ""
    
    def _extract_field(self, text: str, field_name: str) -> str:
        """Extract a specific field from a section"""
        pattern = rf"{field_name}:\s*(.+?)(?=\n\w+:|$)"
        match = re.search(pattern, text, re.DOTALL)
        return match.group(1).strip() if match else ""
    
    def _parse_word_breakdown(self, breakdown_text: str) -> List[Dict[str, str]]:
        """Parse word-by-word breakdown into structured format"""
        words = []
        
        # Look for lines with word breakdown format
        lines = breakdown_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line or not re.match(r'^[^\s]', line):
                continue
                
            # Try to parse format: [word] ([reading]) - [meaning] - [part of speech] - [grammar notes]
            match = re.match(r'^(.+?)\s*\((.+?)\)\s*-\s*(.+?)\s*-\s*(.+?)\s*-\s*(.+)$', line)
            if match:
                words.append({
                    "word": match.group(1).strip(),
                    "reading": match.group(2).strip(),
                    "meaning": match.group(3).strip(),
                    "part_of_speech": match.group(4).strip(),
                    "grammar_notes": match.group(5).strip()
                })
        
        return words
    
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
    """Test the enhanced LLM integration"""
    
    # Setup paths
    project_root = Path(__file__).parent
    models_dir = project_root / "models"
    llama_cli_path = models_dir / "llama.cpp" / "build" / "bin" / "llama-cli"
    model_path = models_dir / "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    
    # Create enhanced LLM
    llm = EnhancedLocalLLM(str(model_path), str(llama_cli_path))
    
    print("🚀 Testing Enhanced LLM Integration")
    print("=" * 50)
    
    # Generate enhanced sentence
    try:
        output = llm.generate_enhanced_sentence("identity", "beginner")
        llm.display_enhanced_output(output)
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
