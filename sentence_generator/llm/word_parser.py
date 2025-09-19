"""Word-by-word parsing and analysis for Japanese sentences."""

import re
from typing import List, Dict, Any, Optional, Tuple
from .schemas import WordAnalysis, WordType

class JapaneseWordParser:
    """Parser for Japanese text with word-by-word analysis"""
    
    def __init__(self):
        # Common Japanese particles
        self.particles = {
            'は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで', 'へ', 'の', 'も', 'か', 'ね', 'よ', 'な', 'だ', 'です', 'である'
        }
        
        # Common verb endings
        self.verb_endings = {
            'ます', 'ません', 'ました', 'ませんでした', 'る', 'う', 'く', 'ぐ', 'す', 'つ', 'ぬ', 'ぶ', 'む', 'る'
        }
        
        # Common adjective endings
        self.adjective_endings = {
            'い', 'な', 'だ', 'です'
        }
        
        # Common suffixes
        self.suffixes = {
            'さん', 'くん', 'ちゃん', 'さま', 'ども', 'たち', 'ら', 'がた'
        }
    
    def parse_sentence(self, japanese_text: str, word_analysis: List[WordAnalysis]) -> Dict[str, Any]:
        """Parse a Japanese sentence with word-by-word analysis"""
        # Clean the text
        cleaned_text = self._clean_text(japanese_text)
        
        # Split into words (basic tokenization)
        words = self._tokenize(cleaned_text)
        
        # Analyze each word
        parsed_words = []
        for i, word in enumerate(words):
            analysis = self._analyze_word(word, word_analysis, i)
            parsed_words.append(analysis)
        
        return {
            "original_text": japanese_text,
            "cleaned_text": cleaned_text,
            "words": parsed_words,
            "word_count": len(parsed_words),
            "analysis_summary": self._create_analysis_summary(parsed_words)
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean Japanese text for parsing"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove punctuation except Japanese punctuation
        text = re.sub(r'[。、！？]', '', text)
        
        return text
    
    def _tokenize(self, text: str) -> List[str]:
        """Basic tokenization of Japanese text"""
        # Split on spaces first
        words = text.split()
        
        # Further split on particles and common boundaries
        tokenized = []
        for word in words:
            # Check if word contains particles
            if any(particle in word for particle in self.particles):
                # Split on particles
                parts = re.split(f'({"|".join(self.particles)})', word)
                tokenized.extend([part for part in parts if part])
            else:
                tokenized.append(word)
        
        return tokenized
    
    def _analyze_word(self, word: str, word_analysis: List[WordAnalysis], position: int) -> Dict[str, Any]:
        """Analyze a single word"""
        # Try to find matching analysis from LLM response
        matching_analysis = self._find_matching_analysis(word, word_analysis)
        
        if matching_analysis:
            return {
                "word": word,
                "position": position,
                "reading": matching_analysis.reading,
                "meaning": matching_analysis.meaning,
                "word_type": matching_analysis.word_type.value,
                "grammar_notes": matching_analysis.grammar_notes,
                "difficulty_level": matching_analysis.difficulty_level,
                "confidence": "high"  # From LLM analysis
            }
        else:
            # Fallback analysis
            return self._fallback_analysis(word, position)
    
    def _find_matching_analysis(self, word: str, word_analysis: List[WordAnalysis]) -> Optional[WordAnalysis]:
        """Find matching analysis for a word"""
        for analysis in word_analysis:
            if analysis.word == word:
                return analysis
        
        # Try partial matching
        for analysis in word_analysis:
            if word in analysis.word or analysis.word in word:
                return analysis
        
        return None
    
    def _fallback_analysis(self, word: str, position: int) -> Dict[str, Any]:
        """Fallback analysis when LLM analysis is not available"""
        word_type = self._guess_word_type(word)
        
        return {
            "word": word,
            "position": position,
            "reading": "[UNKNOWN]",
            "meaning": "[UNKNOWN]",
            "word_type": word_type.value,
            "grammar_notes": self._get_grammar_notes(word, word_type),
            "difficulty_level": self._guess_difficulty(word, word_type),
            "confidence": "low"  # Fallback analysis
        }
    
    def _guess_word_type(self, word: str) -> WordType:
        """Guess word type based on patterns"""
        # Check for particles
        if word in self.particles:
            return WordType.PARTICLE
        
        # Check for verb endings
        if any(word.endswith(ending) for ending in self.verb_endings):
            return WordType.VERB
        
        # Check for adjective endings
        if any(word.endswith(ending) for ending in self.adjective_endings):
            return WordType.ADJECTIVE
        
        # Check for suffixes
        if any(word.endswith(suffix) for suffix in self.suffixes):
            return WordType.SUFFIX
        
        # Check for hiragana/katakana patterns
        if re.match(r'^[ひらがな]+$', word):
            return WordType.NOUN
        elif re.match(r'^[カタカナ]+$', word):
            return WordType.NOUN
        
        # Default to noun
        return WordType.NOUN
    
    def _get_grammar_notes(self, word: str, word_type: WordType) -> str:
        """Get grammar notes for a word"""
        if word_type == WordType.PARTICLE:
            return f"Particle: {word}"
        elif word_type == WordType.VERB:
            return f"Verb ending: {word}"
        elif word_type == WordType.ADJECTIVE:
            return f"Adjective ending: {word}"
        elif word_type == WordType.SUFFIX:
            return f"Honorific suffix: {word}"
        else:
            return f"Word type: {word_type.value}"
    
    def _guess_difficulty(self, word: str, word_type: WordType) -> int:
        """Guess difficulty level (1-5)"""
        if word_type == WordType.PARTICLE:
            return 1  # Basic particles are easy
        elif word_type == WordType.SUFFIX:
            return 2  # Honorifics are somewhat easy
        elif len(word) <= 2:
            return 2  # Short words are easier
        elif len(word) >= 4:
            return 4  # Long words are harder
        else:
            return 3  # Medium difficulty
    
    def _create_analysis_summary(self, parsed_words: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create summary of word analysis"""
        word_types = {}
        difficulty_levels = []
        confidence_levels = {}
        
        for word_data in parsed_words:
            word_type = word_data["word_type"]
            word_types[word_type] = word_types.get(word_type, 0) + 1
            
            if word_data["difficulty_level"]:
                difficulty_levels.append(word_data["difficulty_level"])
            
            confidence = word_data["confidence"]
            confidence_levels[confidence] = confidence_levels.get(confidence, 0) + 1
        
        avg_difficulty = sum(difficulty_levels) / len(difficulty_levels) if difficulty_levels else 0
        
        return {
            "word_type_distribution": word_types,
            "average_difficulty": round(avg_difficulty, 1),
            "confidence_distribution": confidence_levels,
            "total_words": len(parsed_words)
        }
    
    def create_word_breakdown_html(self, parsed_sentence: Dict[str, Any]) -> str:
        """Create HTML breakdown of the sentence"""
        html_parts = ['<div class="sentence-breakdown">']
        html_parts.append(f'<h3>Sentence Analysis: {parsed_sentence["original_text"]}</h3>')
        
        html_parts.append('<div class="words">')
        for word_data in parsed_sentence["words"]:
            html_parts.append(f'''
                <div class="word" data-position="{word_data["position"]}">
                    <span class="japanese">{word_data["word"]}</span>
                    <span class="reading">({word_data["reading"]})</span>
                    <span class="meaning">{word_data["meaning"]}</span>
                    <span class="type">{word_data["word_type"]}</span>
                    <span class="difficulty">Level {word_data["difficulty_level"]}</span>
                </div>
            ''')
        html_parts.append('</div>')
        
        # Add summary
        summary = parsed_sentence["analysis_summary"]
        html_parts.append(f'''
            <div class="summary">
                <h4>Summary</h4>
                <p>Total words: {summary["total_words"]}</p>
                <p>Average difficulty: {summary["average_difficulty"]}</p>
                <p>Word types: {", ".join(f"{k}: {v}" for k, v in summary["word_type_distribution"].items())}</p>
            </div>
        ''')
        
        html_parts.append('</div>')
        return ''.join(html_parts)
