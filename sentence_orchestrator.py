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
        
        # Load comprehensive data
        self.vocab_data = []
        self.verbs_data = []
        self.adjectives_data = []
        self.rules_data = {}
        
        self._load_comprehensive_data()
        self._build_enhanced_themes()
    
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
            
            # Add fallback words if categories are empty
            self._add_fallback_words(theme_name, theme_words)
            
            enhanced_themes[theme_name] = theme_words
        
        # Update the word generator's themes
        self.word_generator.theme_words = enhanced_themes
    
    def _add_fallback_words(self, theme_name: str, theme_words: Dict[str, List[str]]):
        """Add fallback words if categories are empty"""
        fallback_words = {
            "school": {
                "places": ["school", "classroom", "library"],
                "people": ["student", "teacher", "friend"],
                "objects": ["book", "pen", "notebook"],
                "activities": ["study", "read", "write", "learn"],
                "verbs": ["study", "read", "write", "learn"],
                "adjectives": ["difficult", "easy", "interesting"]
            },
            "shopping": {
                "places": ["store", "market", "mall"],
                "people": ["customer", "clerk", "friend"],
                "objects": ["money", "bag", "clothes", "food"],
                "activities": ["buy", "pay", "choose"],
                "verbs": ["buy", "pay", "choose", "shop"],
                "adjectives": ["expensive", "cheap", "good"]
            },
            "hangout": {
                "places": ["park", "cafe", "restaurant"],
                "people": ["friend", "family", "group"],
                "objects": ["coffee", "food", "phone"],
                "activities": ["meet", "eat", "drink", "talk"],
                "verbs": ["meet", "eat", "drink", "talk"],
                "adjectives": ["fun", "interesting", "good"]
            },
            "home": {
                "places": ["house", "room", "kitchen"],
                "people": ["family", "mother", "father"],
                "objects": ["bed", "table", "TV", "food"],
                "activities": ["sleep", "cook", "clean", "relax"],
                "verbs": ["sleep", "cook", "clean", "relax"],
                "adjectives": ["quiet", "comfortable", "warm"]
            },
            "travel": {
                "places": ["station", "airport", "hotel"],
                "people": ["traveler", "guide", "friend"],
                "objects": ["ticket", "bag", "camera"],
                "activities": ["go", "visit", "explore", "travel"],
                "verbs": ["go", "visit", "explore", "travel"],
                "adjectives": ["interesting", "beautiful", "far"]
            }
        }
        
        fallback = fallback_words.get(theme_name, {})
        for category, words in theme_words.items():
            if not words and category in fallback:
                words.extend(fallback[category])
    
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
        # Create enhanced prompt with grammar rules
        grammar_context = self._get_grammar_context(word_seed.theme)
        
        enhanced_prompt = f"""You are a Japanese language expert. Create a natural Japanese sentence using these words.

Theme: {word_seed.theme}
Words: {', '.join(word_seed.words)}

Grammar Guidelines:
{grammar_context}

Requirements:
- Use N5/N4 level Japanese
- Make it sound natural and conversational
- Use appropriate particles (は, が, を, に, で, etc.)
- Include proper verb conjugations
- Keep it simple but grammatically correct

Output only the Japanese sentence."""

        return self.word_generator._call_local_llm(enhanced_prompt)
    
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
    
    args = parser.parse_args()
    
    try:
        # Create orchestrator
        orchestrator = SentenceOrchestrator(args.data_dir)
        
        # Generate sentences
        print(f"Generating {args.count} sentences for theme '{args.theme}'...")
        if not args.no_llm:
            print("(Using LLM for sentence generation)")
        else:
            print("(Using rule-based generation)")
        
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


if __name__ == "__main__":
    main()
