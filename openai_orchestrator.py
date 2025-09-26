#!/usr/bin/env python3
"""OpenAI-powered sentence orchestrator with enhanced Japanese generation."""

import os
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from openai import OpenAI
from sentence_seed_generator import WordSeedGenerator

@dataclass
class OpenAISentenceResult:
    """Result from OpenAI sentence generation"""
    theme: str
    words: List[str]
    japanese_sentence: str
    english_translation: str
    word_analysis: List[Dict[str, str]]
    grammar_notes: Optional[str] = None
    difficulty_level: str = "N5/N4"

class OpenAIOrchestrator:
    """Orchestrator using OpenAI API for Japanese sentence generation"""
    
    def __init__(self, data_dir: str = "tmp", api_key: Optional[str] = None):
        self.data_dir = Path(data_dir)
        self.word_generator = WordSeedGenerator(data_dir)
        
        # Initialize OpenAI client
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            # Try to get from environment
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OpenAI API key not provided. Set OPENAI_API_KEY environment variable or pass api_key parameter.")
            self.client = OpenAI(api_key=api_key)
        
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
            print(f"Loaded {len(self.vocab_data)} vocab items from vocab.json")
        
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
        """Build enhanced theme mappings from comprehensive data"""
        enhanced_themes = {}
        
        theme_keywords = {
            "school": ["school", "education", "student", "teacher", "class", "study", "learn", "book", "exam", "test"],
            "shopping": ["shop", "buy", "store", "market", "money", "price", "clothes", "food", "customer"],
            "hangout": ["friend", "meet", "cafe", "restaurant", "park", "fun", "talk", "eat", "drink"],
            "home": ["home", "house", "family", "room", "kitchen", "bed", "sleep", "cook", "clean"],
            "travel": ["travel", "trip", "station", "airport", "hotel", "visit", "explore", "journey"]
        }
        
        for theme_name in theme_keywords.keys():
            theme_words = {
                "places": [],
                "people": [],
                "objects": [],
                "activities": [],
                "verbs": [],
                "adjectives": []
            }
            
            # Extract words from vocabulary
            for vocab in self.vocab_data:
                tags = vocab.get("tags", [])
                category = vocab.get("category", "")
                entity = vocab.get("entity", "")
                english = vocab.get("english", "")
                
                if self._matches_theme(theme_name, tags, category, entity, english):
                    # Categorize the word
                    if any(word in english.lower() for word in ["place", "location", "room", "building"]):
                        theme_words["places"].append(english)
                    elif any(word in english.lower() for word in ["person", "people", "student", "teacher"]):
                        theme_words["people"].append(english)
                    elif any(word in english.lower() for word in ["object", "thing", "item", "tool"]):
                        theme_words["objects"].append(english)
                    elif any(word in english.lower() for word in ["action", "activity", "verb"]):
                        theme_words["activities"].append(english)
                    else:
                        theme_words["objects"].append(english)  # Default to objects
            
            # Extract verbs
            for verb in self.verbs_data:
                tags = verb.get("tags", [])
                english = verb.get("english", "")
                
                if self._matches_theme(theme_name, tags, "", "", english):
                    theme_words["verbs"].append(english)
            
            # Extract adjectives
            for adj in self.adjectives_data:
                tags = adj.get("tags", [])
                english = adj.get("english", "")
                
                if self._matches_theme(theme_name, tags, "", "", english):
                    theme_words["adjectives"].append(english)
            
            enhanced_themes[theme_name] = theme_words
        
        # Update the word generator's themes
        self.word_generator.theme_words = enhanced_themes
    
    def _matches_theme(self, theme: str, tags: List[str], category: str, entity: str, english: str) -> bool:
        """Check if a word matches a theme"""
        theme_keywords = {
            "school": ["school", "education", "student", "teacher", "class", "study", "learn", "book", "exam", "test"],
            "shopping": ["shop", "buy", "store", "market", "money", "price", "clothes", "food", "customer"],
            "hangout": ["friend", "meet", "cafe", "restaurant", "park", "fun", "talk", "eat", "drink"],
            "home": ["home", "house", "family", "room", "kitchen", "bed", "sleep", "cook", "clean"],
            "travel": ["travel", "trip", "station", "airport", "hotel", "visit", "explore", "journey"]
        }
        
        keywords = theme_keywords.get(theme, [])
        text_to_check = " ".join(tags + [category, entity, english]).lower()
        
        return any(keyword in text_to_check for keyword in keywords)
    
    def generate_sentence(self, theme: str) -> OpenAISentenceResult:
        """Generate a complete sentence using OpenAI"""
        # Generate word seed
        word_seeds = self.word_generator.generate_word_seed(theme, 1, run_llm=False)
        if not word_seeds:
            raise ValueError(f"No word seeds generated for theme: {theme}")
        
        word_seed = word_seeds[0]
        
        # Create OpenAI prompt
        prompt = self._create_openai_prompt(word_seed)
        
        # Call OpenAI API
        response = self._call_openai(prompt)
        
        # Parse response
        return self._parse_openai_response(response, word_seed)
    
    def _create_openai_prompt(self, word_seed) -> str:
        """Create a comprehensive prompt for OpenAI"""
        grammar_context = self._get_grammar_context(word_seed.theme)
        
        prompt = f"""You are a Japanese language expert. Create a natural Japanese sentence using the provided words.

Theme: {word_seed.theme}
Words to incorporate: {', '.join(word_seed.words)}

Grammar Guidelines:
{grammar_context}

Requirements:
- Use N5/N4 level Japanese (beginner-friendly)
- Make it sound natural and conversational
- Use appropriate particles (は, が, を, に, で, etc.)
- Include proper verb conjugations
- Keep it simple but grammatically correct
- Incorporate as many of the provided words as possible naturally

Please respond with a JSON object in this exact format:
{{
    "japanese": "自然な日本語の文",
    "english": "Natural English translation",
    "word_analysis": [
        {{
            "word": "日本語",
            "reading": "にほんご",
            "meaning": "Japanese language",
            "word_type": "noun",
            "grammar_notes": "Subject of the sentence"
        }}
    ],
    "grammar_notes": "Brief explanation of key grammar points",
    "difficulty_level": 3
}}"""
        
        return prompt
    
    def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using the more affordable model
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Japanese language expert. Always respond with valid JSON following the exact schema provided."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise RuntimeError(f"OpenAI API call failed: {e}")
    
    def _parse_openai_response(self, response: str, word_seed) -> OpenAISentenceResult:
        """Parse OpenAI response into structured result"""
        try:
            # Clean up the response (remove any markdown formatting)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.endswith("```"):
                response = response[:-3]
            
            data = json.loads(response)
            
            return OpenAISentenceResult(
                theme=word_seed.theme,
                words=word_seed.words,
                japanese_sentence=data["japanese"],
                english_translation=data["english"],
                word_analysis=data.get("word_analysis", []),
                grammar_notes=data.get("grammar_notes"),
                difficulty_level=f"N{data.get('difficulty_level', 4)}"
            )
            
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Failed to parse OpenAI response as JSON: {e}")
        except KeyError as e:
            raise RuntimeError(f"Missing required field in OpenAI response: {e}")
    
    def _get_grammar_context(self, theme: str) -> str:
        """Get relevant grammar rules for the theme"""
        relevant_rules = []
        
        for rule_name, rule_data in self.rules_data.items():
            if isinstance(rule_data, dict):
                description = rule_data.get("description", "")
                if theme.lower() in description.lower() or "general" in description.lower():
                    relevant_rules.append(f"- {rule_name}: {description}")
        
        if not relevant_rules:
            # Fallback to basic grammar patterns
            relevant_rules = [
                "Identity: A は B です (A is B)",
                "Action: A を Verb (A does verb)",
                "Location: A で Verb (A at location)",
                "Time: A に Verb (A at time)"
            ]
        
        return "\n".join(relevant_rules)
    
    def generate_multiple_sentences(self, theme: str, count: int) -> List[OpenAISentenceResult]:
        """Generate multiple sentences for a theme"""
        results = []
        
        for i in range(count):
            try:
                result = self.generate_sentence(theme)
                results.append(result)
            except Exception as e:
                print(f"Error generating sentence {i+1}: {e}")
                continue
        
        return results
    
    def print_results(self, results: List[OpenAISentenceResult]):
        """Print results in a formatted way"""
        for i, result in enumerate(results, 1):
            print(f"\n--- Sentence {i} ---")
            print(f"Theme: {result.theme}")
            print(f"Words: {', '.join(result.words)}")
            print(f"Japanese: {result.japanese_sentence}")
            print(f"English: {result.english_translation}")
            
            if result.word_analysis:
                print("Word Analysis:")
                for word in result.word_analysis:
                    print(f"  {word['word']} ({word['reading']}) - {word['meaning']} ({word['word_type']})")
            
            if result.grammar_notes:
                print(f"Grammar: {result.grammar_notes}")
            
            print(f"Level: {result.difficulty_level}")
            print("-" * 50)

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Generate Japanese sentences using OpenAI API"
    )
    
    parser.add_argument(
        "--theme", 
        default="school", 
        help="Theme for sentence generation (default: school)"
    )
    
    parser.add_argument(
        "--count", 
        type=int, 
        default=1, 
        help="Number of sentences to generate (default: 1)"
    )
    
    parser.add_argument(
        "--data-dir", 
        default="tmp", 
        help="Directory containing vocabulary data (default: tmp)"
    )
    
    parser.add_argument(
        "--api-key", 
        help="OpenAI API key (or set OPENAI_API_KEY environment variable)"
    )
    
    args = parser.parse_args()
    
    try:
        # Create orchestrator
        orchestrator = OpenAIOrchestrator(args.data_dir, args.api_key)
        
        # Generate sentences
        print(f"Generating {args.count} sentences for theme '{args.theme}' using OpenAI...")
        
        results = orchestrator.generate_multiple_sentences(args.theme, args.count)
        
        # Print results
        orchestrator.print_results(results)
        
        print(f"\nGenerated {len(results)} sentences successfully!")
        
    except ValueError as e:
        print(f"Error: {e}")
        exit(1)
    except RuntimeError as e:
        print(f"OpenAI Error: {e}")
        exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        exit(1)

if __name__ == "__main__":
    main()
