"""API-based LLM integration (OpenAI, Anthropic, etc.)."""

import json
import requests
from typing import Dict, Any, Optional, List
from .base_llm import BaseLLM
from .schemas import LLMPrompt, LLMSentenceResponse

class OpenAILLM(BaseLLM):
    """OpenAI API integration"""
    
    def __init__(self, api_key: str, model: str = "gpt-4", base_url: Optional[str] = None):
        super().__init__()
        self.api_key = api_key
        self.model = model
        self.base_url = base_url or "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def is_available(self) -> bool:
        """Check if OpenAI API is available"""
        try:
            response = requests.get(
                f"{self.base_url}/models",
                headers=self.headers,
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def generate_sentence(self, prompt: LLMPrompt) -> LLMSentenceResponse:
        """Generate a sentence using OpenAI API"""
        if not self.is_available():
            raise RuntimeError("OpenAI API is not available. Check API key and connection.")
        
        prompt_text = self.format_prompt_text(prompt)
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a Japanese language expert. Always respond with valid JSON following the exact schema provided."
                },
                {
                    "role": "user",
                    "content": prompt_text
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000,
            "top_p": 0.9,
            "frequency_penalty": 0.1,
            "presence_penalty": 0.1
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise RuntimeError(f"API request failed: {response.status_code} - {response.text}")
            
            result = response.json()
            response_text = result["choices"][0]["message"]["content"]
            
            return self.validate_and_parse_response(response_text)
            
        except requests.RequestException as e:
            raise RuntimeError(f"API request failed: {e}")

class AnthropicLLM(BaseLLM):
    """Anthropic Claude API integration"""
    
    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229"):
        super().__init__()
        self.api_key = api_key
        self.model = model
        self.base_url = "https://api.anthropic.com/v1"
        self.headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
    
    def is_available(self) -> bool:
        """Check if Anthropic API is available"""
        try:
            response = requests.get(
                f"{self.base_url}/models",
                headers=self.headers,
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def generate_sentence(self, prompt: LLMPrompt) -> LLMSentenceResponse:
        """Generate a sentence using Anthropic API"""
        if not self.is_available():
            raise RuntimeError("Anthropic API is not available. Check API key and connection.")
        
        prompt_text = self.format_prompt_text(prompt)
        
        payload = {
            "model": self.model,
            "max_tokens": 2000,
            "temperature": 0.7,
            "messages": [
                {
                    "role": "user",
                    "content": prompt_text
                }
            ]
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/messages",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise RuntimeError(f"API request failed: {response.status_code} - {response.text}")
            
            result = response.json()
            response_text = result["content"][0]["text"]
            
            return self.validate_and_parse_response(response_text)
            
        except requests.RequestException as e:
            raise RuntimeError(f"API request failed: {e}")

class GoogleLLM(BaseLLM):
    """Google Gemini API integration"""
    
    def __init__(self, api_key: str, model: str = "gemini-pro"):
        super().__init__()
        self.api_key = api_key
        self.model = model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
    
    def is_available(self) -> bool:
        """Check if Google API is available"""
        try:
            response = requests.get(
                f"{self.base_url}/models?key={self.api_key}",
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def generate_sentence(self, prompt: LLMPrompt) -> LLMSentenceResponse:
        """Generate a sentence using Google API"""
        if not self.is_available():
            raise RuntimeError("Google API is not available. Check API key and connection.")
        
        prompt_text = self.format_prompt_text(prompt)
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt_text
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.9,
                "maxOutputTokens": 2000
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}",
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise RuntimeError(f"API request failed: {response.status_code} - {response.text}")
            
            result = response.json()
            response_text = result["candidates"][0]["content"]["parts"][0]["text"]
            
            return self.validate_and_parse_response(response_text)
            
        except requests.RequestException as e:
            raise RuntimeError(f"API request failed: {e}")

class APILLMManager:
    """Manager for API-based LLM instances"""
    
    def __init__(self):
        self.instances = {}
    
    def create_openai_instance(self, name: str, api_key: str, model: str = "gpt-4") -> OpenAILLM:
        """Create OpenAI instance"""
        instance = OpenAILLM(api_key, model)
        self.instances[name] = instance
        return instance
    
    def create_anthropic_instance(self, name: str, api_key: str, model: str = "claude-3-sonnet-20240229") -> AnthropicLLM:
        """Create Anthropic instance"""
        instance = AnthropicLLM(api_key, model)
        self.instances[name] = instance
        return instance
    
    def create_google_instance(self, name: str, api_key: str, model: str = "gemini-pro") -> GoogleLLM:
        """Create Google instance"""
        instance = GoogleLLM(api_key, model)
        self.instances[name] = instance
        return instance
    
    def get_instance(self, name: str) -> Optional[BaseLLM]:
        """Get an existing LLM instance"""
        return self.instances.get(name)
    
    def list_available_instances(self) -> List[str]:
        """List available LLM instances"""
        return list(self.instances.keys())
    
    def test_all_instances(self) -> Dict[str, bool]:
        """Test availability of all instances"""
        results = {}
        for name, instance in self.instances.items():
            results[name] = instance.is_available()
        return results
