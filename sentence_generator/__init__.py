"""Japanese Sentence Generator with LLM Integration."""

from .core.sentence_generator import SentenceGenerator
from .core.models import Sentence, CompatibilityScore
from .core.enums import RelationshipType, SemanticDomain
from .llm.llm_manager import UnifiedLLMManager, setup_llm_manager, create_default_config
from .llm.schemas import LLMSentenceResponse, WordAnalysis, WordType
from .llm.word_parser import JapaneseWordParser

__version__ = "2.0.0"
__author__ = "Benky-fy Team"

__all__ = [
    "SentenceGenerator",
    "Sentence", 
    "CompatibilityScore",
    "RelationshipType",
    "SemanticDomain",
    "UnifiedLLMManager",
    "setup_llm_manager",
    "create_default_config",
    "LLMSentenceResponse",
    "WordAnalysis", 
    "WordType",
    "JapaneseWordParser"
]
