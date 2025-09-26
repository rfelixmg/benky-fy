# Frontend Integration Documentation

## 🚨 Critical Issues (Priority)

1. **Settings Button Non-Functional** - Users can't access/modify input mode preferences
2. **Save Functionality Broken** - Settings changes not persisting

## 🔧 Backend API Documentation

### Core Endpoints

#### 1. Settings Management
```javascript
// Get current settings
GET /begginer/{module}/api/settings

// Save settings
POST /begginer/{module}/api/settings
Content-Type: application/json
{
  "flashcard_type": "translation",
  "display_mode": "kanji",
  "kana_type": "hiragana",
  "input_modes": ["hiragana", "romaji", "kanji", "english"],
  "proportions": {
    "kana": 0.3,
    "kanji": 0.2,
    "kanji_furigana": 0.2,
    "english": 0.3
  }
}
```

#### 2. Display Text (Real-time Updates)
```javascript
GET /begginer/{module}/api/display-text?item_id=0&display_mode=kanji&kana_type=hiragana
// Returns: { "text": "為る", "script": "kanji", "mode": "kanji" }
```

#### 3. Answer Checking
```javascript
POST /begginer/{module}/check
Content-Type: application/x-www-form-urlencoded
{
  "item_id": "0",
  "user_hiragana": "する",
  "user_romaji": "suru",
  "user_kanji": "為る",
  "user_english": "to do"
}
```

#### 4. Correct Answers
```javascript
GET /begginer/{module}/api/correct-answers?item_id=0
// Returns: { "user_hiragana": "する", "user_romaji": "suru", ... }
```

## 🧪 Test Endpoints (for debugging)

```bash
# Settings Test
curl "http://localhost:8080/begginer/verbs/api/test-settings"

# Display Text Test
curl "http://localhost:8080/begginer/verbs/api/test-display-text?item_id=0&display_mode=kanji"

# Answer Checking Test
curl -X POST "http://localhost:8080/begginer/verbs/api/test-check-answers" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "item_id=0&user_hiragana=する&input_modes=hiragana"
```

## 📁 Frontend Files to Review

- `/app/templates/flashcard_new.html` - Main flashcard template
- `/app/static/js/main.js` - Main JavaScript logic
- `/app/static/js/utils.js` - Utility functions

## 🔍 Key Functions to Check

- `toggleSettings()` - Settings modal toggle
- `handleDisplayModeChange()` - Display mode updates
- `handleKanaTypeChange()` - Kana type updates
- `updateDisplayText()` - Real-time display updates
- Settings save functionality

## 🎯 Action Items

### Priority 1 (48 hours)
1. Fix settings button functionality
2. Fix save functionality
3. Test all existing features

### Priority 2
1. Implement proper input field monitoring
2. Add comprehensive testing
3. Document frontend architecture

## 📞 Support

Josh is available for:
- Technical questions about the backend
- API endpoint clarifications
- Integration testing
- Debugging assistance

**Current Status:**
- ✅ Backend: Complete and tested
- ❌ Frontend: Needs immediate attention
