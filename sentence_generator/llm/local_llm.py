"""Local LLM integration using llama.cpp."""

import subprocess
import json
import tempfile
import os
from typing import Dict, Any, Optional
from .base_llm import BaseLLM
from .schemas import LLMPrompt, LLMSentenceResponse

class LocalLLM(BaseLLM):
    """Local LLM integration using llama.cpp"""
    
    def __init__(self, model_path: str, executable_path: str = "llama-cli"):
        super().__init__()
        self.model_path = model_path
        self.executable_path = executable_path
        self.temp_dir = tempfile.mkdtemp()
    
    def is_available(self) -> bool:
        """Check if llama.cpp is available and model exists"""
        try:
            # Check if executable exists
            result = subprocess.run([self.executable_path, "--help"], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode != 0:
                return False
            
            # Check if model file exists
            return os.path.exists(self.model_path)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def generate_sentence(self, prompt: LLMPrompt) -> LLMSentenceResponse:
        """Generate a sentence using local LLM"""
        if not self.is_available():
            raise RuntimeError("Local LLM is not available. Check model path and executable.")
        
        prompt_text = self.format_prompt_text(prompt)
        
        # Create temporary files for input and output
        input_file = os.path.join(self.temp_dir, "input.txt")
        output_file = os.path.join(self.temp_dir, "output.txt")
        
        try:
            # Write prompt to input file
            with open(input_file, 'w', encoding='utf-8') as f:
                f.write(prompt_text)
            
            # Run llama.cpp
            cmd = [
                self.executable_path,
                "-m", self.model_path,
                "-f", input_file,
                "-n", "200",  # number of tokens to predict
                "--temp", "0.7",
                "--top-p", "0.9",
                "--top-k", "40",
                "--repeat-penalty", "1.1",
                "--ctx-size", "2048",
                "--batch-size", "512",
                "--no-conversation"  # disable conversation mode for JSON output
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode != 0:
                raise RuntimeError(f"LLM execution failed: {result.stderr}")
            
            # Get response from stdout
            response_text = result.stdout
            
            # Extract JSON from response (remove any prefix text)
            response_text = self._extract_json_from_response(response_text)
            
            return self.validate_and_parse_response(response_text)
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("LLM generation timed out")
        except Exception as e:
            raise RuntimeError(f"Error generating sentence: {e}")
    
    def _extract_json_from_response(self, response_text: str) -> str:
        """Extract JSON from LLM response text"""
        # Find the first { and last } to extract JSON
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}')
        
        if start_idx == -1 or end_idx == -1:
            raise ValueError("No JSON found in response")
        
        json_text = response_text[start_idx:end_idx + 1]
        
        # Try to parse and reformat to ensure valid JSON
        try:
            parsed = json.loads(json_text)
            return json.dumps(parsed, ensure_ascii=False, indent=2)
        except json.JSONDecodeError:
            # If parsing fails, try to fix common issues
            json_text = self._fix_json_issues(json_text)
            return json_text
    
    def _fix_json_issues(self, json_text: str) -> str:
        """Fix common JSON issues in LLM responses"""
        # Remove any trailing commas before closing braces/brackets
        import re
        json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
        
        # Ensure all strings are properly quoted
        json_text = re.sub(r'(\w+):', r'"\1":', json_text)
        
        return json_text
    
    def cleanup(self):
        """Clean up temporary files"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)

class LocalLLMManager:
    """Manager for local LLM instances"""
    
    def __init__(self):
        self.instances = {}
    
    def create_instance(self, name: str, model_path: str, executable_path: str = "llama-cli") -> LocalLLM:
        """Create a new local LLM instance"""
        instance = LocalLLM(model_path, executable_path)
        self.instances[name] = instance
        return instance
    
    def get_instance(self, name: str) -> Optional[LocalLLM]:
        """Get an existing LLM instance"""
        return self.instances.get(name)
    
    def list_available_models(self, models_dir: str) -> list[str]:
        """List available model files in a directory"""
        if not os.path.exists(models_dir):
            return []
        
        model_extensions = ['.gguf', '.bin', '.safetensors']
        models = []
        
        for file in os.listdir(models_dir):
            if any(file.endswith(ext) for ext in model_extensions):
                models.append(os.path.join(models_dir, file))
        
        return models
    
    def cleanup_all(self):
        """Clean up all instances"""
        for instance in self.instances.values():
            instance.cleanup()
        self.instances.clear()
