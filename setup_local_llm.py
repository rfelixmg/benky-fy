#!/usr/bin/env python3
"""Setup script for local LLM integration."""

import os
import sys
from pathlib import Path
from sentence_generator import UnifiedLLMManager, create_default_config

def setup_local_llm():
    """Setup local LLM with llama.cpp"""
    
    # Paths
    project_root = Path(__file__).parent
    models_dir = project_root / "models"
    llama_cpp_dir = models_dir / "llama.cpp"
    llama_cli_path = llama_cpp_dir / "build" / "bin" / "llama-cli"
    model_path = models_dir / "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    
    print("🤖 Setting up Local LLM Integration")
    print("=" * 50)
    
    # Check if llama-cli exists
    if not llama_cli_path.exists():
        print(f"❌ llama-cli not found at: {llama_cli_path}")
        print("Please run the build commands first:")
        print("  cd models/llama.cpp")
        print("  mkdir build && cd build")
        print("  cmake .. && make -j4")
        return None
    
    # Check if model exists
    if not model_path.exists():
        print(f"❌ Model not found at: {model_path}")
        print("Please download a model first:")
        print("  cd models")
        print("  curl -L -o tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \\")
        print("    'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf'")
        return None
    
    print(f"✅ llama-cli found: {llama_cli_path}")
    print(f"✅ Model found: {model_path}")
    
    # Create LLM manager
    manager = UnifiedLLMManager()
    
    # Create local LLM instance
    instance = manager.create_local_instance(
        name="tinyllama",
        model_path=str(model_path),
        executable_path=str(llama_cli_path)
    )
    
    # Test availability
    print("\n🧪 Testing LLM availability...")
    if instance.is_available():
        print("✅ Local LLM is ready!")
        
        # Test generation
        print("\n🚀 Testing sentence generation...")
        try:
            result = manager.generate_enhanced_sentence("tinyllama", "identity", "beginner")
            print(f"✅ Generated: {result['enhanced_japanese']}")
            print(f"✅ English: {result['enhanced_english']}")
            print(f"✅ Difficulty: {result['difficulty_level']}/5")
            
            print("\n🎉 Local LLM setup complete!")
            print("\nYou can now use:")
            print("  python main.py --count 3 --enhance --llm tinyllama")
            
            return manager
            
        except Exception as e:
            print(f"❌ Error testing generation: {e}")
            return None
    else:
        print("❌ Local LLM not available. Check paths.")
        return None

def test_basic_generation():
    """Test basic sentence generation without LLM"""
    print("\n🧪 Testing basic sentence generation...")
    
    from sentence_generator import SentenceGenerator
    
    generator = SentenceGenerator("tmp")
    sentence = generator.generate_sentence("identity", debug=True)
    
    print(f"✅ Generated: {sentence.japanese}")
    print(f"✅ English: {sentence.english}")
    print(f"✅ Coherent: {'Yes' if sentence.coherence_passed else 'No'}")
    
    return True

if __name__ == "__main__":
    print("🚀 Japanese Sentence Generator - Local LLM Setup")
    print("=" * 60)
    
    # Test basic generation first
    if not test_basic_generation():
        print("❌ Basic generation failed. Check your setup.")
        sys.exit(1)
    
    # Setup local LLM
    manager = setup_local_llm()
    
    if manager:
        print("\n🎯 Setup Summary:")
        print("✅ Basic sentence generation: Working")
        print("✅ Local LLM integration: Ready")
        print("✅ llama.cpp: Built and tested")
        print("✅ Model: Downloaded and loaded")
        
        print("\n📋 Available Commands:")
        print("  python main.py --count 5                    # Basic generation")
        print("  python main.py --count 3 --enhance --llm tinyllama  # LLM enhanced")
        print("  python main.py --list-themes                 # List themes")
        
    else:
        print("\n❌ Setup incomplete. Please check the errors above.")
        sys.exit(1)
