#!/usr/bin/env python3
"""
Sentence Orchestrator - Combines word seed generation with LLM for Japanese sentence creation

This orchestrator uses comprehensive vocabulary data from tmp/ directory to generate
theme-based word seeds and then uses a local LLM to create natural Japanese sentences.
"""

import json
import random
import subprocess
import argparse
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Optional, Any
from sentence_seed_generator import WordSeedGenerator, WordSeed


@dataclass
class SentenceResult:
    """Represents a complete sentence generation result"""
    theme: str
    word_seed: WordSeed
    japanese_sentence: str
    english_translation: Optional[str] = None
    grammar_notes: Optional[str] = None
    difficulty_level: str = "N5/N4"


class SentenceOrchestrator:
    """Orchestrates the complete sentence generation process"""
    
    def __init__(self, data_dir: str = "tmp"):
        self.data_dir = Path(data_dir)
        self.word_generator = WordSeedGenerator(data_dir)
        self.show_prompt = False
        
        # Load comprehensive data
        self.vocab_data = []
        self.verbs_data = []
        self.adjectives_data = []
        self.rules_data = {}
        
        self._load_comprehensive_data()
        self._build_enhanced_themes()
        
        # LLM server management
        self.llm_server_process = None
        self.llm_server_port = 8080
        self.llm_server_ready = False
    
    def _load_comprehensive_data(self):
        """Load all data files from tmp directory"""
        # Load vocabulary
        vocab_file = self.data_dir / "vocab.json"
        if vocab_file.exists():
            with open(vocab_file, 'r', encoding='utf-8') as f:
                self.vocab_data = json.load(f)
                print(f"Loaded {len(self.vocab_data)} vocabulary items")
        
        # Load verbs
        verbs_file = self.data_dir / "verbs.json"
        if verbs_file.exists():
            with open(verbs_file, 'r', encoding='utf-8') as f:
                self.verbs_data = json.load(f)
                print(f"Loaded {len(self.verbs_data)} verbs")
        
        # Load adjectives
        adjectives_file = self.data_dir / "adjectives.json"
        if adjectives_file.exists():
            with open(adjectives_file, 'r', encoding='utf-8') as f:
                self.adjectives_data = json.load(f)
                print(f"Loaded {len(self.adjectives_data)} adjectives")
        
        # Load grammar rules
        rules_file = self.data_dir / "rules.json"
        if rules_file.exists():
            with open(rules_file, 'r', encoding='utf-8') as f:
                self.rules_data = json.load(f)
                print(f"Loaded {len(self.rules_data)} grammar rules")
    
    def _build_enhanced_themes(self):
        """Build enhanced theme mappings using comprehensive data"""
        enhanced_themes = {}
        
        # Extract words by tags and categories from vocab data
        for theme_name in ["school", "shopping", "hangout", "home", "travel"]:
            theme_words = {
                "places": [],
                "people": [],
                "objects": [],
                "activities": [],
                "adjectives": [],
                "verbs": []
            }
            
            # Extract from vocab data
            for item in self.vocab_data:
                tags = item.get("tags", [])
                category = item.get("category", "")
                entity = item.get("entity", "")
                english = item.get("english", "")
                
                # Theme-based filtering
                if self._matches_theme(theme_name, tags, category, entity, english):
                    if entity == "place":
                        theme_words["places"].append(english)
                    elif entity == "person":
                        theme_words["people"].append(english)
                    elif entity in ["thing", "concept"]:
                        theme_words["objects"].append(english)
            
            # Extract verbs
            for verb in self.verbs_data:
                usage = verb.get("usage", [])
                if theme_name in usage or any(theme_name in str(u) for u in usage):
                    theme_words["verbs"].append(verb["english"])
            
            # Extract adjectives
            for adj in self.adjectives_data:
                tags = adj.get("tags", [])
                if self._matches_theme(theme_name, tags, "", "", adj.get("english", "")):
                    theme_words["adjectives"].append(adj["english"])
            
            enhanced_themes[theme_name] = theme_words
        
        # Update the word generator's themes
        self.word_generator.theme_words = enhanced_themes
    
    def _matches_theme(self, theme: str, tags: List[str], category: str, entity: str, english: str) -> bool:
        """Check if a word matches a theme"""
        theme_keywords = {
            "school": ["school", "study", "student", "teacher", "class", "book", "learn"],
            "shopping": ["shopping", "buy", "store", "market", "money", "clothes", "food"],
            "hangout": ["friend", "meet", "cafe", "restaurant", "park", "fun", "social"],
            "home": ["home", "house", "family", "room", "sleep", "cook", "relax"],
            "travel": ["travel", "go", "station", "train", "hotel", "visit", "trip"]
        }
        
        keywords = theme_keywords.get(theme, [])
        text_to_check = " ".join(tags + [category, entity, english]).lower()
        
        return any(keyword in text_to_check for keyword in keywords)
    
    def _start_llm_server(self):
        """Start the LLM server in the background"""
        if self.llm_server_process is not None:
            return  # Already running
        
        project_root = Path(__file__).parent
        models_dir = project_root / "models"
        llama_server_path = models_dir / "llama.cpp" / "build" / "bin" / "llama-server"
        model_path = models_dir / "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
        
        # Check if files exist
        if not llama_server_path.exists():
            raise FileNotFoundError(f"llama-server not found at {llama_server_path}")
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        # Start server in background
        cmd = [
            str(llama_server_path),
            "-m", str(model_path),
            "--host", "127.0.0.1",
            "--port", str(self.llm_server_port),
            "--no-webui",  # Disable web UI for faster startup
            "--threads", "4"
        ]
        
        try:
            self.llm_server_process = subprocess.Popen(
                cmd, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for server to start and check if it's ready
            import time
            import requests
            
            for attempt in range(10):  # Try for up to 10 seconds
                time.sleep(1)
                
                # Check if process is still running
                if self.llm_server_process.poll() is not None:
                    # Process died, get error output
                    stdout, stderr = self.llm_server_process.communicate()
                    raise RuntimeError(f"LLM server process died. Stderr: {stderr}")
                
                # Try to connect to the server
                try:
                    response = requests.get(f"http://127.0.0.1:{self.llm_server_port}/health", timeout=1)
                    if response.status_code == 200:
                        self.llm_server_ready = True
                        print(f"✅ LLM server started on port {self.llm_server_port}")
                        return
                except requests.exceptions.RequestException:
                    continue  # Server not ready yet
            
            # If we get here, server didn't start in time
            raise RuntimeError("LLM server failed to start within 10 seconds")
                
        except Exception as e:
            self.llm_server_process = None
            raise RuntimeError(f"Failed to start LLM server: {e}")
    
    def _stop_llm_server(self):
        """Stop the LLM server"""
        if self.llm_server_process is not None:
            self.llm_server_process.terminate()
            self.llm_server_process.wait()
            self.llm_server_process = None
            self.llm_server_ready = False
            print("🛑 LLM server stopped")
    
    def generate_sentence(self, theme: str, use_llm: bool = True) -> SentenceResult:
        """Generate a complete sentence with word seed and LLM processing"""
        try:
            # Generate word seed
            word_seeds = self.word_generator.generate_word_seed(theme, 1, run_llm=False)
            if not word_seeds:
                raise ValueError(f"No word seeds generated for theme '{theme}'")
            word_seed = word_seeds[0]
            
            if use_llm:
                # Use LLM to create sentence
                japanese_sentence = self._call_enhanced_llm(word_seed)
            else:
                # Use rule-based generation as fallback
                japanese_sentence = self._generate_rule_based_sentence(word_seed)
            
            return SentenceResult(
                theme=theme,
                word_seed=word_seed,
                japanese_sentence=japanese_sentence,
                difficulty_level="N5/N4"
            )
        except Exception as e:
            print(f"Error in generate_sentence: {e}")
            raise
    
    def _call_enhanced_llm(self, word_seed: WordSeed) -> str:
        """Call LLM with enhanced prompt including grammar context"""
        # First generate a basic Japanese sentence using rule-based approach
        basic_sentence = self._generate_rule_based_sentence(word_seed)
        
        # Then ask LLM to improve it (similar to robust_llm_integration.py)
        grammar_context = self._get_grammar_context(word_seed.theme)
        
        enhanced_prompt = f"""Improve this Japanese sentence to make it more natural:
Words to incorporate: {', '.join(word_seed.words)}
Theme: {word_seed.theme}

Grammar Guidelines:
{grammar_context}

Requirements:
- Use N5/N4 level Japanese
- Make it sound natural and conversational
- Include proper verb conjugations
- Keep it simple but grammatically correct

Provide a better version in this format:
Japanese: [improved sentence]"""

        # Show prompt if requested
        if self.show_prompt:
            print("\n" + "="*60)
            print("LLM PROMPT:")
            print("="*60)
            print(enhanced_prompt)
            print("="*60)
            print("END PROMPT")
            print("="*60 + "\nNow response:")

        try:
            response = self._call_llm_improved(enhanced_prompt)
            
            # Parse the response to extract Japanese sentence
            import re
            
            # Try different patterns that the LLM might use
            patterns = [
                r'Japanese:\s*(.+)',
                r'N5/N4:\s*(.+)',
                r'([あ-んア-ン一-龯]+[。！？])',  # Japanese sentence ending with punctuation
                r'([あ-んア-ン一-龯]+)',  # Any Japanese text
            ]
            
            for pattern in patterns:
                match = re.search(pattern, response)
                if match:
                    japanese_text = match.group(1).strip()
                    # Clean up the text
                    japanese_text = re.sub(r'[。！？]+$', '。', japanese_text)  # Ensure ends with period
                    return japanese_text
            
            # If no pattern matches, fallback to basic sentence
            return basic_sentence
                
        except Exception as e:
            print(f"LLM enhancement failed: {e}")
            # Fallback to basic sentence
            return basic_sentence
    
    def _call_llm_improved(self, prompt: str) -> str:
        """Call LLM using command line approach with better error handling"""
        project_root = Path(__file__).parent
        models_dir = project_root / "models"
        llama_cli_path = models_dir / "llama.cpp" / "build" / "bin" / "llama-cli"
        model_path = models_dir / "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
        
        # Check if files exist
        if not llama_cli_path.exists():
            raise FileNotFoundError(f"llama-cli not found at {llama_cli_path}")
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        # Use the same command structure as robust_llm_integration.py
        cmd = [
            str(llama_cli_path),
            "-m", str(model_path),
            "-p", prompt,  # Use -p instead of -f
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
                
                # Debug: show the raw response
                if self.show_prompt:
                    print(f"Raw LLM response: {repr(response)}")
                
                # Remove the prompt from the response
                if prompt in response:
                    response = response.replace(prompt, "").strip()
                
                # Check if response contains only [end of text] or similar markers
                if not response or response in ["[end of text]", "end of text", ""]:
                    raise RuntimeError("LLM could not generate Japanese content - model may not support Japanese generation")
                
                return response
            else:
                raise RuntimeError(f"LLM execution failed: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            raise RuntimeError("LLM generation timed out")
        except Exception as e:
            raise RuntimeError(f"Error calling LLM: {e}")
    
    def _get_grammar_context(self, theme: str) -> str:
        """Get relevant grammar rules for the theme"""
        relevant_rules = []
        
        # Select relevant grammar patterns based on theme
        if theme in ["school", "home"]:
            relevant_rules.extend([
                "Identity: A は B です (A is B)",
                "Action: A を Verb (A does verb)",
                "Location: A で Verb (A at location)"
            ])
        elif theme == "shopping":
            relevant_rules.extend([
                "Action: A を Verb (A buys/gets B)",
                "Possession: A の B (A's B)",
                "Description: A は Adj です (A is adjective)"
            ])
        elif theme in ["hangout", "travel"]:
            relevant_rules.extend([
                "Motion: A は Place に Verb (A goes to place)",
                "Meeting: A と Verb (A with B)",
                "Time: A に Verb (A at time)"
            ])
        
        return "\n".join(relevant_rules) if relevant_rules else "Basic Japanese grammar patterns"
    
    def _generate_rule_based_sentence(self, word_seed: WordSeed) -> str:
        """Generate sentence using grammar rules as fallback"""
        words = word_seed.words
        
        if not words:
            return "文を作成できませんでした。"
        
        # Simple rule-based generation with better word handling
        if len(words) >= 2:
            # Use first word as subject, second as action
            subject = words[0]
            action = words[1]
            
            # Basic sentence structures
            if word_seed.theme in ["school", "home"]:
                return f"{subject}は{action}ます。"
            elif word_seed.theme == "shopping":
                return f"{subject}を{action}ます。"
            elif word_seed.theme in ["hangout", "travel"]:
                return f"{subject}は{action}ます。"
            else:
                return f"{subject}は{action}ます。"
        else:
            # Single word - use identity structure
            return f"{words[0]}です。"
        
        return "文を作成できませんでした。"
    
    def generate_multiple_sentences(self, theme: str, count: int = 5, use_llm: bool = True) -> List[SentenceResult]:
        """Generate multiple sentences for a theme"""
        results = []
        
        for i in range(count):
            try:
                result = self.generate_sentence(theme, use_llm)
                results.append(result)
            except Exception as e:
                print(f"Error generating sentence {i+1}: {e}")
                continue
        
        return results
    
    def print_results(self, results: List[SentenceResult]):
        """Print sentence results in a formatted way"""
        for i, result in enumerate(results, 1):
            print(f"\n--- Sentence {i} ---")
            print(f"Theme: {result.theme}")
            print(f"Words: {', '.join(result.word_seed.words)}")
            print(f"Japanese: {result.japanese_sentence}")
            if result.english_translation:
                print(f"English: {result.english_translation}")
            if result.grammar_notes:
                print(f"Grammar: {result.grammar_notes}")
            print(f"Level: {result.difficulty_level}")
            print("-" * 50)
    
    def cleanup(self):
        """Clean up resources"""
        self._stop_llm_server()


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Generate Japanese sentences using word seeds and LLM orchestration"
    )
    
    parser.add_argument(
        "--theme",
        type=str,
        default="school",
        choices=["school", "shopping", "hangout", "home", "travel"],
        help="Theme for sentence generation (default: school)"
    )
    
    parser.add_argument(
        "--count",
        type=int,
        default=3,
        help="Number of sentences to generate (default: 3)"
    )
    
    parser.add_argument(
        "--no-llm",
        action="store_true",
        help="Use rule-based generation instead of LLM"
    )
    
    parser.add_argument(
        "--data-dir",
        type=str,
        default="tmp",
        help="Directory containing comprehensive data files (default: tmp)"
    )
    
    parser.add_argument(
        "--show-prompt",
        action="store_true",
        help="Show the LLM prompt for testing with external LLMs"
    )
    
    args = parser.parse_args()
    
    orchestrator = None
    try:
        # Create orchestrator
        orchestrator = SentenceOrchestrator(args.data_dir)
        
        # Generate sentences
        print(f"Generating {args.count} sentences for theme '{args.theme}'...")
        if not args.no_llm:
            print("(Using LLM for sentence generation)")
        else:
            print("(Using rule-based generation)")
        
        # Set show_prompt flag for orchestrator
        orchestrator.show_prompt = args.show_prompt
        
        results = orchestrator.generate_multiple_sentences(
            args.theme, 
            args.count, 
            use_llm=not args.no_llm
        )
        
        # Print results
        orchestrator.print_results(results)
        
        print(f"\nGenerated {len(results)} sentences successfully!")
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Please ensure the data directory exists and contains the required files.")
        exit(1)
    except RuntimeError as e:
        print(f"LLM Error: {e}")
        print("Please ensure the LLM is properly set up and accessible.")
        exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        exit(1)
    finally:
        # Clean up resources
        if orchestrator:
            orchestrator.cleanup()


if __name__ == "__main__":
    main()
