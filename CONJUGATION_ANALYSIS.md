# Adjectives Conjugation Analysis

## Current Data Structure Analysis

### Sample Adjectives Data
```json
{
  "english": "fun, enjoyable",
  "kanji": "楽しい",
  "kana": "たのしい", 
  "hiragana": "たのしい",
  "romaji": "tanoshii",
  "entity_tags": ["thing"],
  "tags": ["feelings"],
  "jlpt_level": "n5",
  "priority_group": "p2"
}
```

### Adjective Types Identified

#### I-Adjectives (い-adjectives) - 14 found
- End in い (hiragana)
- Examples: たのしい, むずかしい, いそがしい, ちかい, とおい, あたらしい, ふるい, おおい, すくない, おもい, かるい, ひろい
- **Note**: きれい and ゆうめい end in い but are na-adjectives (special cases)

#### Na-Adjectives (な-adjectives) - 6 found  
- Don't end in い or end in い but are na-adjectives
- Examples: たいへん, かんたん, しずか, しんせつ, げんき, べんり
- **Special cases**: きれい, ゆうめい (end in い but are na-adjectives)

## Proposed Conjugation Schema

### I-Adjective Conjugations
```json
{
  "conjugation_type": "i_adjective",
  "conjugations": {
    "present": {
      "kanji": "楽しい",
      "hiragana": "たのしい",
      "romaji": "tanoshii"
    },
    "past": {
      "kanji": "楽しかった", 
      "hiragana": "たのしかった",
      "romaji": "tanoshikatta"
    },
    "negative": {
      "kanji": "楽しくない",
      "hiragana": "たのしくない", 
      "romaji": "tanoshikunai"
    },
    "negative_past": {
      "kanji": "楽しくなかった",
      "hiragana": "たのしくなかった",
      "romaji": "tanoshikunakatta"
    },
    "adverbial": {
      "kanji": "楽しく",
      "hiragana": "たのしく",
      "romaji": "tanoshiku"
    }
  }
}
```

### Na-Adjective Conjugations
```json
{
  "conjugation_type": "na_adjective", 
  "conjugations": {
    "present": {
      "kanji": "静か",
      "hiragana": "しずか",
      "romaji": "shizuka"
    },
    "past": {
      "kanji": "静かだった",
      "hiragana": "しずかだった", 
      "romaji": "shizuka datta"
    },
    "negative": {
      "kanji": "静かではない",
      "hiragana": "しずかではない",
      "romaji": "shizuka dewa nai"
    },
    "negative_past": {
      "kanji": "静かではなかった", 
      "hiragana": "しずかではなかった",
      "romaji": "shizuka dewa nakatta"
    },
    "adverbial": {
      "kanji": "静かに",
      "hiragana": "しずかに",
      "romaji": "shizuka ni"
    }
  }
}
```

## Conjugation Rules

### I-Adjective Rules
1. **Present**: Base form (たのしい)
2. **Past**: Remove い, add かった (たのしかった)
3. **Negative**: Remove い, add くない (たのしくない)
4. **Negative Past**: Remove い, add くなかった (たのしくなかった)
5. **Adverbial**: Remove い, add く (たのしく)

### Na-Adjective Rules  
1. **Present**: Base form + だ (しずかだ) - often omitted
2. **Past**: Base form + だった (しずかだった)
3. **Negative**: Base form + ではない (しずかではない)
4. **Negative Past**: Base form + ではなかった (しずかではなかった)
5. **Adverbial**: Base form + に (しずかに)

## Special Cases
- **きれい**: Ends in い but is na-adjective
- **ゆうめい**: Ends in い but is na-adjective
- **いい/よい**: Irregular i-adjective (よい is the base form)

## Implementation Plan

### Phase 1: Data Enhancement
1. Add `conjugation_type` field to identify i/na adjectives
2. Add `conjugations` object with all forms
3. Handle special cases explicitly

### Phase 2: Validation Logic
1. Create conjugation checker classes
2. Implement rule-based conjugation generation
3. Add validation for user input

### Phase 3: UI Integration
1. Add conjugation settings panel
2. Show conjugation forms in flashcards
3. Allow practice of specific forms

## Testing Strategy
1. **Unit Tests**: Test conjugation generation for each type
2. **Integration Tests**: Test with actual flashcard system
3. **Edge Cases**: Test special cases and irregular forms
4. **User Testing**: Verify conjugation accuracy and usability
