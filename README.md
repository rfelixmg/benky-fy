# Benkyo-Fi

Benkyo-Fi is your AI study assistant for learning Japanese.  
It combines the power of spaced repetition flashcards, active recall through typing, and adaptive AI to grow your vocabulary and grammar knowledge step by step.  

✨ Features:
- Smart flashcards that repeat common mistakes more often  
- Typing-based answers for real recall (not just multiple choice)  
- AI-driven learning path that expands with your progress  
- Tracks your progress and adjusts difficulty automatically
- **Furigana support** for Japanese verbs with reading annotations
- Multiple learning modules: Hiragana, Katakana, and Japanese Verbs  

## Getting Started

### Prerequisites
- Python 3.x
- Required environment variables:
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`

### Installation
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables (create a `.env` file or export them):
   ```bash
   export GOOGLE_OAUTH_CLIENT_ID=your_client_id
   export GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
   ```

### Running the Server

#### Development Mode (Recommended)
```bash
# Using virtual environment
.env/bin/python run.py

# Or if you have the virtual environment activated
python run.py
```
The server will start on `http://localhost:8081` in debug mode.

#### Alternative Methods
```bash
# Using Flask command
flask --app app run --debug --host=localhost --port=8081

# Using Gunicorn (production-like)
gunicorn -w 4 -b localhost:8081 run:app
```

## Available Learning Modules

### Japanese Verbs (`/begginer/verbs`)
- **46 essential Japanese verbs** with comprehensive conjugations
- **Furigana support** - toggle reading annotations on/off
- **Smart kanji analysis** - breaks down verbs into meaningful stems
- **Multiple display formats**:
  - HTML ruby tags: 考[かんが]える (semantic accessibility)
  - Text brackets: 考[かんが]える (compatibility)
  - Plain kanji: 考える (traditional)

### Hiragana (`/begginer/hiragana`)
- Learn the fundamental Japanese phonetic writing system
- Spaced repetition flashcards for efficient memorization

### Katakana (`/begginer/katakana`)  
- Master the second phonetic system used for foreign words
- Interactive typing-based learning
