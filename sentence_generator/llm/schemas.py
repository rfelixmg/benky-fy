"""Schema definitions for LLM response validation."""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from enum import Enum

class WordType(Enum):
    """Types of words in Japanese sentences"""
    NOUN = "noun"
    VERB = "verb"
    ADJECTIVE = "adjective"
    PARTICLE = "particle"
    ADVERB = "adverb"
    CONJUNCTION = "conjunction"
    INTERJECTION = "interjection"
    SUFFIX = "suffix"
    PREFIX = "prefix"

@dataclass
class WordAnalysis:
    """Analysis of a single word in the sentence"""
    word: str
    reading: str  # hiragana/katakana reading
    meaning: str  # English meaning
    word_type: WordType
    grammar_notes: Optional[str] = None
    difficulty_level: Optional[int] = None  # 1-5 scale

@dataclass
class LLMSentenceResponse:
    """Structured response from LLM for sentence generation"""
    japanese: str
    english: str
    word_analysis: List[WordAnalysis]
    grammar_notes: Optional[str] = None
    difficulty_level: Optional[int] = None  # 1-5 scale
    cultural_notes: Optional[str] = None
    alternative_translations: Optional[List[str]] = None

@dataclass
class LLMPrompt:
    """Prompt structure for LLM sentence generation"""
    seed_sentence: str  # Our generated sentence as seed
    theme: str
    structure: str
    guidelines: List[str]
    target_level: str = "beginner"  # beginner, intermediate, advanced
    include_cultural_context: bool = True
    include_grammar_explanation: bool = True

class LLMResponseValidator:
    """Validates LLM responses against expected schema"""
    
    def __init__(self):
        self.required_fields = ["japanese", "english", "word_analysis"]
        self.word_analysis_required = ["word", "reading", "meaning", "word_type"]
    
    def validate_response(self, response: Dict[str, Any]) -> tuple[bool, List[str]]:
        """Validate LLM response structure"""
        errors = []
        
        # Check required top-level fields
        for field in self.required_fields:
            if field not in response:
                errors.append(f"Missing required field: {field}")
        
        # Validate Japanese and English are strings
        if "japanese" in response and not isinstance(response["japanese"], str):
            errors.append("Japanese field must be a string")
        
        if "english" in response and not isinstance(response["english"], str):
            errors.append("English field must be a string")
        
        # Validate word_analysis is a list
        if "word_analysis" in response:
            if not isinstance(response["word_analysis"], list):
                errors.append("word_analysis must be a list")
            else:
                # Validate each word analysis
                for i, word_analysis in enumerate(response["word_analysis"]):
                    if not isinstance(word_analysis, dict):
                        errors.append(f"word_analysis[{i}] must be a dictionary")
                        continue
                    
                    for field in self.word_analysis_required:
                        if field not in word_analysis:
                            errors.append(f"word_analysis[{i}] missing required field: {field}")
                    
                    # Validate word_type is valid enum value
                    if "word_type" in word_analysis:
                        try:
                            WordType(word_analysis["word_type"])
                        except ValueError:
                            errors.append(f"word_analysis[{i}] has invalid word_type: {word_analysis['word_type']}")
        
        return len(errors) == 0, errors
    
    def parse_response(self, response_dict: Dict[str, Any]) -> LLMSentenceResponse:
        """Parse validated response into structured object"""
        word_analyses = []
        
        for word_data in response_dict.get("word_analysis", []):
            word_analysis = WordAnalysis(
                word=word_data["word"],
                reading=word_data["reading"],
                meaning=word_data["meaning"],
                word_type=WordType(word_data["word_type"]),
                grammar_notes=word_data.get("grammar_notes"),
                difficulty_level=word_data.get("difficulty_level")
            )
            word_analyses.append(word_analysis)
        
        return LLMSentenceResponse(
            japanese=response_dict["japanese"],
            english=response_dict["english"],
            word_analysis=word_analyses,
            grammar_notes=response_dict.get("grammar_notes"),
            difficulty_level=response_dict.get("difficulty_level"),
            cultural_notes=response_dict.get("cultural_notes"),
            alternative_translations=response_dict.get("alternative_translations")
        )
