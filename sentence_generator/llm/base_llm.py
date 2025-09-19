"""Base LLM interface for sentence generation."""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from .schemas import LLMPrompt, LLMSentenceResponse, LLMResponseValidator

class BaseLLM(ABC):
    """Abstract base class for LLM integration"""
    
    def __init__(self):
        self.validator = LLMResponseValidator()
    
    @abstractmethod
    def generate_sentence(self, prompt: LLMPrompt) -> LLMSentenceResponse:
        """Generate a sentence using the LLM"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the LLM is available/configured"""
        pass
    
    def create_prompt(self, seed_sentence: str, theme: str, structure: str, 
                     target_level: str = "beginner") -> LLMPrompt:
        """Create a structured prompt for the LLM"""
        guidelines = [
            "Generate a natural Japanese sentence that follows the given structure",
            "Ensure the sentence is grammatically correct and contextually appropriate",
            "Provide word-by-word analysis with readings and meanings",
            "Include grammar notes explaining the sentence structure",
            "Make the sentence suitable for the target learning level",
            "Ensure cultural appropriateness and natural usage"
        ]
        
        return LLMPrompt(
            seed_sentence=seed_sentence,
            theme=theme,
            structure=structure,
            guidelines=guidelines,
            target_level=target_level,
            include_cultural_context=True,
            include_grammar_explanation=True
        )
    
    def format_prompt_text(self, prompt: LLMPrompt) -> str:
        """Format the prompt as text for the LLM"""
        prompt_text = f"""You are a Japanese language expert. Generate a natural Japanese sentence based on the following requirements:

SEED SENTENCE: {prompt.seed_sentence}
THEME: {prompt.theme}
STRUCTURE: {prompt.structure}
TARGET LEVEL: {prompt.target_level}

GUIDELINES:
{chr(10).join(f"- {guideline}" for guideline in prompt.guidelines)}

Please respond with a JSON object containing:
{{
    "japanese": "The Japanese sentence",
    "english": "The English translation",
    "word_analysis": [
        {{
            "word": "word_in_japanese",
            "reading": "hiragana_reading",
            "meaning": "english_meaning",
            "word_type": "noun|verb|adjective|particle|adverb|conjunction|interjection|suffix|prefix",
            "grammar_notes": "optional_grammar_notes",
            "difficulty_level": 1-5
        }}
    ],
    "grammar_notes": "Explanation of the sentence structure and grammar",
    "difficulty_level": 1-5,
    "cultural_notes": "Optional cultural context",
    "alternative_translations": ["alternative1", "alternative2"]
}}

Ensure the response is valid JSON and follows the exact schema above."""
        
        return prompt_text
    
    def validate_and_parse_response(self, response_text: str) -> LLMSentenceResponse:
        """Validate and parse LLM response"""
        import json
        
        try:
            response_dict = json.loads(response_text)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response: {e}")
        
        is_valid, errors = self.validator.validate_response(response_dict)
        if not is_valid:
            raise ValueError(f"Response validation failed: {', '.join(errors)}")
        
        return self.validator.parse_response(response_dict)
