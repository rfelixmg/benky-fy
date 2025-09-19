# Japanese Sentence Generator v2.0 - Refactored with LLM Integration

## 🎯 Overview

This is a major refactor of the Japanese sentence generation system, breaking down the monolithic code into modular components and adding LLM integration for enhanced sentence generation.

## 🏗️ New Architecture

### Core Modules (`sentence_generator/core/`)
- **`sentence_generator.py`** - Main sentence generation logic
- **`semantic_intelligence.py`** - Semantic compatibility and contextual appropriateness
- **`coherence_checker.py`** - Logical coherence validation
- **`models.py`** - Data models and dataclasses
- **`enums.py`** - Enums for relationship types and semantic domains

### Data Modules (`sentence_generator/data/`)
- **`loader.py`** - Data loading utilities for vocabulary, rules, etc.

### LLM Integration (`sentence_generator/llm/`)
- **`base_llm.py`** - Abstract base class for LLM integration
- **`local_llm.py`** - Local LLM integration (llama.cpp)
- **`api_llm.py`** - API-based LLM integration (OpenAI, Anthropic, Google)
- **`llm_manager.py`** - Unified manager for all LLM types
- **`schemas.py`** - Schema definitions for LLM responses
- **`word_parser.py`** - Word-by-word parsing and analysis

## 🚀 Usage

### Basic Sentence Generation
```bash
# Generate 5 random sentences
python main.py --count 5

# Generate sentences for a specific theme
python main.py --count 3 --theme identity

# List available themes
python main.py --list-themes

# Show only coherent sentences
python main.py --count 10 --coherent-only

# Enable debug mode
python main.py --count 3 --debug
```

### LLM Enhancement (Coming Soon)
```bash
# Enhance sentences with OpenAI
python main.py --count 3 --enhance --llm openai --target-level intermediate

# Compare multiple LLMs
python main.py --count 1 --compare-llms openai anthropic google
```

## 📁 Clean Project Structure

```
benky-fy/
├── sentence_generator/          # Main package
│   ├── core/                    # Core generation logic
│   ├── data/                    # Data loading utilities
│   ├── llm/                     # LLM integration
│   └── __init__.py
├── tmp/                         # Data files (cleaned up)
│   ├── vocab.json               # Vocabulary data
│   ├── verbs.json               # Verb data
│   ├── adjectives.json          # Adjective data
│   ├── rules.json               # Sentence structure rules
│   └── modifiers.json           # Modifier data
├── main.py                      # New main entry point
└── README_REFACTORED.md         # This file
```

## 🧹 What Was Cleaned Up

### Removed Files (Rubbish)
- `context-words.txt`
- `core.json`
- `entities.json`
- `info.schema`
- `merged_df.json`
- `normalize_json_fields.py`
- `restructure_data.py`
- `sentence-seed-generation.py`
- `structure-themes.json`
- `tmp.txt`
- `verb-classification.json`
- `verbs_original.json`
- `verbs.json.bkp`
- `vocab_interests.json`
- `vocab_original.json`
- `main.py` (old monolithic version)
- `__pycache__/`

### Kept Essential Files
- `vocab.json` - Core vocabulary
- `verbs.json` - Verb data
- `adjectives.json` - Adjective data
- `rules.json` - Sentence structure rules
- `modifiers.json` - Modifier data

## 🔧 LLM Integration Features

### Local LLM Support
- **llama.cpp integration** for local model inference
- Support for GGUF model formats
- Configurable model paths and executable paths

### API LLM Support
- **OpenAI GPT-4/3.5** integration
- **Anthropic Claude** integration
- **Google Gemini** integration
- Unified API interface

### Enhanced Features
- **Schema validation** for LLM responses
- **Word-by-word analysis** with readings and meanings
- **Grammar explanations** and cultural notes
- **Difficulty level assessment** (1-5 scale)
- **Alternative translations**

## 🎨 Example LLM Response Schema

```json
{
    "japanese": "先生は学生に日本語を教えています",
    "english": "The teacher is teaching Japanese to the students",
    "word_analysis": [
        {
            "word": "先生",
            "reading": "せんせい",
            "meaning": "teacher",
            "word_type": "noun",
            "grammar_notes": "Subject of the sentence",
            "difficulty_level": 2
        },
        {
            "word": "は",
            "reading": "は",
            "meaning": "topic particle",
            "word_type": "particle",
            "grammar_notes": "Marks the topic of the sentence",
            "difficulty_level": 1
        }
    ],
    "grammar_notes": "This sentence uses the は particle to mark the topic and に particle to indicate the indirect object.",
    "difficulty_level": 3,
    "cultural_notes": "In Japanese culture, teachers are highly respected.",
    "alternative_translations": [
        "The teacher teaches Japanese to students",
        "Students are being taught Japanese by the teacher"
    ]
}
```

## 🚧 Next Steps

1. **Test LLM Integration** - Set up API keys and test with real LLMs
2. **Improve Coherence Checker** - Make it more strict about logical inconsistencies
3. **Add More LLM Providers** - Support for more API providers
4. **Web Interface** - Create a web UI for the system
5. **Batch Processing** - Add support for processing large datasets

## 🔄 Migration from Old System

The old monolithic `tmp/main.py` has been completely refactored. The new system:
- ✅ Maintains all existing functionality
- ✅ Adds LLM integration capabilities
- ✅ Provides cleaner, more maintainable code
- ✅ Separates concerns into logical modules
- ✅ Includes comprehensive error handling
- ✅ Supports both local and API-based LLMs

## 📝 Configuration

Create a configuration file for LLM setup:

```python
from sentence_generator import create_default_config, setup_llm_manager

config = create_default_config()
config["api_keys"]["openai"] = "your-api-key-here"
config["local_models"]["llama2"] = {
    "model_path": "/path/to/llama2.gguf",
    "executable_path": "llama-cli"
}

manager = setup_llm_manager(config)
```

This refactored system provides a solid foundation for advanced Japanese sentence generation with AI enhancement capabilities!
