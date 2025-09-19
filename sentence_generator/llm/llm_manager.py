"""Unified LLM manager for sentence generation."""

from typing import Dict, Any, Optional, List
from .base_llm import BaseLLM
from .local_llm import LocalLLM, LocalLLMManager
from .api_llm import APILLMManager, OpenAILLM, AnthropicLLM, GoogleLLM
from .word_parser import JapaneseWordParser
from .schemas import LLMPrompt, LLMSentenceResponse
from ..core.sentence_generator import SentenceGenerator
from ..core.models import Sentence

class UnifiedLLMManager:
    """Unified manager for all LLM types"""
    
    def __init__(self):
        self.local_manager = LocalLLMManager()
        self.api_manager = APILLMManager()
        self.word_parser = JapaneseWordParser()
        self.sentence_generator = SentenceGenerator()
    
    def create_local_instance(self, name: str, model_path: str, executable_path: str = "llama-cli") -> LocalLLM:
        """Create a local LLM instance"""
        return self.local_manager.create_instance(name, model_path, executable_path)
    
    def create_openai_instance(self, name: str, api_key: str, model: str = "gpt-4") -> OpenAILLM:
        """Create OpenAI instance"""
        return self.api_manager.create_openai_instance(name, api_key, model)
    
    def create_anthropic_instance(self, name: str, api_key: str, model: str = "claude-3-sonnet-20240229") -> AnthropicLLM:
        """Create Anthropic instance"""
        return self.api_manager.create_anthropic_instance(name, api_key, model)
    
    def create_google_instance(self, name: str, api_key: str, model: str = "gemini-pro") -> GoogleLLM:
        """Create Google instance"""
        return self.api_manager.create_google_instance(name, api_key, model)
    
    def get_instance(self, name: str) -> Optional[BaseLLM]:
        """Get any LLM instance by name"""
        # Try local first
        instance = self.local_manager.get_instance(name)
        if instance:
            return instance
        
        # Try API
        return self.api_manager.get_instance(name)
    
    def list_all_instances(self) -> Dict[str, Dict[str, Any]]:
        """List all available instances with their status"""
        instances = {}
        
        # Local instances
        for name in self.local_manager.instances.keys():
            instance = self.local_manager.get_instance(name)
            instances[name] = {
                "type": "local",
                "available": instance.is_available() if instance else False
            }
        
        # API instances
        for name in self.api_manager.instances.keys():
            instance = self.api_manager.get_instance(name)
            instances[name] = {
                "type": "api",
                "available": instance.is_available() if instance else False
            }
        
        return instances
    
    def generate_enhanced_sentence(self, llm_name: str, theme: Optional[str] = None, 
                                 target_level: str = "beginner", debug: bool = False) -> Dict[str, Any]:
        """Generate an enhanced sentence using LLM"""
        # Get LLM instance
        llm_instance = self.get_instance(llm_name)
        if not llm_instance:
            raise ValueError(f"LLM instance '{llm_name}' not found")
        
        if not llm_instance.is_available():
            raise RuntimeError(f"LLM instance '{llm_name}' is not available")
        
        # Generate seed sentence
        seed_sentence = self.sentence_generator.generate_sentence(theme, debug)
        
        # Create LLM prompt
        prompt = llm_instance.create_prompt(
            seed_sentence=f"{seed_sentence.japanese} ({seed_sentence.english})",
            theme=seed_sentence.theme,
            structure=seed_sentence.structure,
            target_level=target_level
        )
        
        # Generate enhanced sentence with LLM
        llm_response = llm_instance.generate_sentence(prompt)
        
        # Parse word-by-word analysis
        word_analysis = self.word_parser.parse_sentence(
            llm_response.japanese, 
            llm_response.word_analysis
        )
        
        return {
            "seed_sentence": seed_sentence,
            "llm_response": llm_response,
            "word_analysis": word_analysis,
            "enhanced_japanese": llm_response.japanese,
            "enhanced_english": llm_response.english,
            "grammar_notes": llm_response.grammar_notes,
            "cultural_notes": llm_response.cultural_notes,
            "difficulty_level": llm_response.difficulty_level,
            "alternative_translations": llm_response.alternative_translations
        }
    
    def batch_generate(self, llm_name: str, count: int = 5, theme: Optional[str] = None,
                      target_level: str = "beginner") -> List[Dict[str, Any]]:
        """Generate multiple enhanced sentences"""
        results = []
        
        for i in range(count):
            try:
                result = self.generate_enhanced_sentence(llm_name, theme, target_level)
                results.append(result)
            except Exception as e:
                print(f"Error generating sentence {i+1}: {e}")
                continue
        
        return results
    
    def compare_llm_outputs(self, llm_names: List[str], theme: Optional[str] = None,
                           target_level: str = "beginner") -> Dict[str, Any]:
        """Compare outputs from multiple LLMs"""
        results = {}
        
        for llm_name in llm_names:
            try:
                result = self.generate_enhanced_sentence(llm_name, theme, target_level)
                results[llm_name] = result
            except Exception as e:
                results[llm_name] = {"error": str(e)}
        
        return results
    
    def cleanup(self):
        """Clean up all resources"""
        self.local_manager.cleanup_all()

# Example usage and configuration
def create_default_config() -> Dict[str, Any]:
    """Create default configuration for LLM instances"""
    return {
        "local_models": {
            "llama2": {
                "model_path": "/path/to/llama2.gguf",
                "executable_path": "llama-cli"
            },
            "mistral": {
                "model_path": "/path/to/mistral.gguf", 
                "executable_path": "llama-cli"
            }
        },
        "api_keys": {
            "openai": "your-openai-api-key",
            "anthropic": "your-anthropic-api-key",
            "google": "your-google-api-key"
        },
        "default_models": {
            "openai": "gpt-4",
            "anthropic": "claude-3-sonnet-20240229",
            "google": "gemini-pro"
        }
    }

def setup_llm_manager(config: Dict[str, Any]) -> UnifiedLLMManager:
    """Setup LLM manager with configuration"""
    manager = UnifiedLLMManager()
    
    # Setup local instances
    for name, local_config in config.get("local_models", {}).items():
        manager.create_local_instance(
            name,
            local_config["model_path"],
            local_config.get("executable_path", "llama-cli")
        )
    
    # Setup API instances
    api_keys = config.get("api_keys", {})
    default_models = config.get("default_models", {})
    
    if "openai" in api_keys:
        manager.create_openai_instance(
            "openai",
            api_keys["openai"],
            default_models.get("openai", "gpt-4")
        )
    
    if "anthropic" in api_keys:
        manager.create_anthropic_instance(
            "anthropic",
            api_keys["anthropic"],
            default_models.get("anthropic", "claude-3-sonnet-20240229")
        )
    
    if "google" in api_keys:
        manager.create_google_instance(
            "google",
            api_keys["google"],
            default_models.get("google", "gemini-pro")
        )
    
    return manager
