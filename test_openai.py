#!/usr/bin/env python3
"""Test OpenAI API connection and basic functionality."""

import os
from openai import OpenAI

def test_openai_connection():
    """Test basic OpenAI API connection"""
    
    # Get API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY environment variable not set")
        print("Please set it with: export OPENAI_API_KEY='sk-your-key-here'")
        return False
    
    try:
        # Initialize client
        client = OpenAI(api_key=api_key)
        
        # Test with a simple request
        print("🔄 Testing OpenAI API connection...")
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user", 
                    "content": "Say 'Hello, OpenAI API is working!' in Japanese."
                }
            ],
            max_tokens=50
        )
        
        result = response.choices[0].message.content
        print(f"✅ OpenAI API is working!")
        print(f"Response: {result}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI API test failed: {e}")
        return False

if __name__ == "__main__":
    test_openai_connection()
