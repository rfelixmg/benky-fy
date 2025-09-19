#!/usr/bin/env python3
"""
Word Seed Generator

A simple Japanese word generator that randomly selects related words based on a theme
and lets the LLM generate natural Japanese sentences from those words.

Usage:
    python sentence_seed_generator.py --theme school --n 5 --run-llm
"""

import json
import random
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass


@dataclass
class WordSeed:
    """Represents a generated word seed"""
    theme: str
    words: List[str]
    prompt_text: str
    llm_response: Optional[str] = None


class WordSeedGenerator:
    """Generates word seeds for Japanese sentence generation"""
    
    def __init__(self, data_dir: str = "datum"):
        self.data_dir = Path(data_dir)
        self.vocab_data = []
        
        # Load vocabulary data
        self._load_vocab_data()
        
        # Theme-based word collections
        self.theme_words = {
            "school": {
                "places": ["school", "classroom", "library", "cafeteria", "gym", "office"],
                "people": ["student", "teacher", "principal", "friend", "classmate"],
                "objects": ["book", "pen", "notebook", "desk", "chair", "blackboard"],
                "activities": ["study", "read", "write", "learn", "teach", "practice"]
            },
            "shopping": {
                "places": ["store", "market", "mall", "shop", "supermarket"],
                "people": ["customer", "clerk", "cashier", "friend"],
                "objects": ["money", "bag", "cart", "receipt", "clothes", "food"],
                "activities": ["buy", "pay", "choose", "compare", "shop"]
            },
            "hangout": {
                "places": ["park", "cafe", "restaurant", "movie theater", "beach"],
                "people": ["friend", "family", "date", "group"],
                "objects": ["coffee", "food", "ticket", "camera", "phone"],
                "activities": ["meet", "eat", "drink", "watch", "talk", "walk"]
            },
            "home": {
                "places": ["house", "room", "kitchen", "bedroom", "living room"],
                "people": ["family", "mother", "father", "sibling", "roommate"],
                "objects": ["bed", "table", "chair", "TV", "computer", "food"],
                "activities": ["sleep", "cook", "clean", "relax", "watch", "eat"]
            },
            "travel": {
                "places": ["station", "airport", "hotel", "city", "country"],
                "people": ["traveler", "guide", "driver", "friend"],
                "objects": ["ticket", "passport", "bag", "camera", "map"],
                "activities": ["go", "come", "visit", "explore", "travel", "arrive"]
            }
        }
    
    def _load_vocab_data(self):
        """Load vocabulary data - no fallbacks, fail clearly if data is missing"""
        vocab_files = ["vocab.json", "vocab-1-6.json", "vocab-small.json"]
        
        vocab_loaded = False
        for vocab_file in vocab_files:
            file_path = self.data_dir / vocab_file
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self.vocab_data = data
                    else:
                        # Handle nested format
                        self.vocab_data = self._convert_vocab_format(data)
                    print(f"Loaded {len(self.vocab_data)} vocab items from {vocab_file}")
                    vocab_loaded = True
                    break
        
        if not vocab_loaded:
            raise FileNotFoundError(f"No vocabulary files found in {self.data_dir}. Expected one of: {vocab_files}")
    
    def _convert_vocab_format(self, data: dict) -> list:
        """Convert nested vocab format to list"""
        vocab_list = []
        if 'kanji' in data and 'kana' in data and 'english' in data:
            for i in range(len(data['kanji'])):
                item = {
                    'english': data['english'][str(i)],
                    'kana': data['kana'][str(i)],
                    'tags': data.get('tag', {}).get(str(i), '').split(', ') if data.get('tag', {}).get(str(i)) else []
                }
                vocab_list.append(item)
        return vocab_list
    
    def generate_word_seed(self, theme: str, n: int = 1, run_llm: bool = False) -> List[WordSeed]:
        """Generate n word seeds for the given theme"""
        seeds = []
        
        for i in range(n):
            # Select 3-5 random words from the theme
            theme_data = self.theme_words.get(theme, self.theme_words["school"])
            
            # Pick 1-2 words from each category
            selected_words = []
            for category, words in theme_data.items():
                if words:  # Make sure category has words
                    num_words = random.randint(1, 2)
                    selected_words.extend(random.sample(words, min(num_words, len(words))))
            
            # Shuffle and limit to 3-5 words total
            random.shuffle(selected_words)
            selected_words = selected_words[:random.randint(3, 5)]
            
            # Create prompt for LLM
            words_str = ", ".join(selected_words)
            prompt_text = f"""Theme: {theme}
Words: {words_str}

Task: Create a natural Japanese sentence using these words. Make it sound natural and appropriate for N5/N4 level Japanese.

Output only the Japanese sentence."""
            
            seed = WordSeed(
                theme=theme,
                words=selected_words,
                prompt_text=prompt_text
            )
            
            # Optionally run LLM
            if run_llm:
                seed.llm_response = self._call_local_llm(prompt_text)
            
            seeds.append(seed)
        
        return seeds
    
    
    def _call_local_llm(self, prompt: str) -> Optional[str]:
        """Call the local LLM with the given prompt - no fallbacks, fail clearly if LLM is not available"""
        project_root = Path(__file__).parent
        models_dir = project_root / "models"
        llama_cli_path = models_dir / "llama.cpp" / "build" / "bin" / "llama-cli"
        model_path = models_dir / "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
        
        # Check if files exist - fail immediately if not
        if not llama_cli_path.exists():
            raise FileNotFoundError(f"llama-cli not found at {llama_cli_path}")
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        # Create a simple prompt for the LLM
        if 'Task:' in prompt:
            simple_prompt = f"Generate a Japanese sentence: {prompt.split('Task:')[1].strip()}"
        else:
            simple_prompt = f"Generate a Japanese sentence: {prompt}"
        
        cmd = [
            str(llama_cli_path),
            "-m", str(model_path),
            "-p", simple_prompt,
            "-n", "50",
            "--temp", "0.7",
            "--no-conversation"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            raise RuntimeError(f"LLM execution failed: {result.stderr}")
        
        response = result.stdout.strip()
        # Clean up the response
        if simple_prompt in response:
            response = response.replace(simple_prompt, "").strip()
        
        if not response:
            raise RuntimeError("LLM returned empty response")
        
        return response
    
    def print_seeds(self, seeds: List[WordSeed]):
        """Print the generated word seeds in a formatted way"""
        for i, seed in enumerate(seeds, 1):
            print(f"\n--- Word Seed {i} ---")
            print(f"Theme: {seed.theme}")
            print(f"Words: {', '.join(seed.words)}")
            print(f"\nPrompt:")
            print(seed.prompt_text)
            
            if seed.llm_response:
                print(f"\nLLM Response:")
                print(seed.llm_response)
            
            print("-" * 50)


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Generate Japanese word seeds with optional LLM integration"
    )
    
    parser.add_argument(
        "--theme", 
        type=str, 
        default="school",
        choices=["school", "shopping", "hangout", "home", "travel"],
        help="Theme for word generation (default: school)"
    )
    
    parser.add_argument(
        "--n", 
        type=int, 
        default=5,
        help="Number of word seeds to generate (default: 5)"
    )
    
    parser.add_argument(
        "--run-llm", 
        action="store_true",
        help="Run local LLM for each generated word seed"
    )
    
    parser.add_argument(
        "--data-dir",
        type=str,
        default="datum",
        help="Directory containing JSON data files (default: datum)"
    )
    
    args = parser.parse_args()
    
    try:
        # Create generator
        generator = WordSeedGenerator(args.data_dir)
        
        # Generate word seeds
        print(f"Generating {args.n} word seeds for theme '{args.theme}'...")
        if args.run_llm:
            print("(Running local LLM for each seed - this may take a while)")
        
        seeds = generator.generate_word_seed(args.theme, args.n, args.run_llm)
        
        # Print results
        generator.print_seeds(seeds)
        
        print(f"\nGenerated {len(seeds)} word seeds successfully!")
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Please ensure the data directory exists and contains vocabulary files.")
        exit(1)
    except RuntimeError as e:
        print(f"LLM Error: {e}")
        print("Please ensure the LLM is properly set up and accessible.")
        exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
