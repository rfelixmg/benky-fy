#!/usr/bin/env python3
"""
Script to normalize furigana/hiragana fields across all JSON files
"""

import json
from pathlib import Path

def load_json(file_path):
    """Load JSON file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, file_path):
    """Save JSON file"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def normalize_vocab_fields(vocab_data):
    """Normalize vocab JSON fields"""
    for item in vocab_data:
        # Standardize hiragana field
        if 'furigana' in item and 'hiragana' not in item:
            item['hiragana'] = item['furigana']
        elif 'kana' in item and 'hiragana' not in item:
            item['hiragana'] = item['kana']
        
        # Remove furigana field if it exists (keep hiragana)
        if 'furigana' in item:
            del item['furigana']
        
        # Ensure we have hiragana field
        if 'hiragana' not in item:
            item['hiragana'] = item.get('kana', '')
    
    return vocab_data

def normalize_verb_fields(verb_data):
    """Normalize verb JSON fields"""
    for verb in verb_data:
        # Standardize hiragana field
        if 'furigana' in verb and 'hiragana' not in verb:
            verb['hiragana'] = verb['furigana']
        
        # Remove furigana field if it exists (keep hiragana)
        if 'furigana' in verb:
            del verb['furigana']
        
        # Normalize conjugations
        if 'conjugations' in verb:
            for conj_type, conj_data in verb['conjugations'].items():
                if isinstance(conj_data, dict):
                    # Standardize hiragana in conjugations
                    if 'furigana' in conj_data and 'hiragana' not in conj_data:
                        conj_data['hiragana'] = conj_data['furigana']
                    
                    # Remove furigana field
                    if 'furigana' in conj_data:
                        del conj_data['furigana']
                    
                    # Ensure we have hiragana field
                    if 'hiragana' not in conj_data:
                        conj_data['hiragana'] = conj_data.get('kanji', '')
    
    return verb_data

def normalize_adjective_fields(adj_data):
    """Normalize adjective JSON fields"""
    for adj in adj_data:
        # Standardize hiragana field
        if 'furigana' in adj and 'hiragana' not in adj:
            adj['hiragana'] = adj['furigana']
        elif 'kana' in adj and 'hiragana' not in adj:
            adj['hiragana'] = adj['kana']
        
        # Remove furigana field if it exists (keep hiragana)
        if 'furigana' in adj:
            del adj['furigana']
        
        # Ensure we have hiragana field
        if 'hiragana' not in adj:
            adj['hiragana'] = adj.get('kana', '')
    
    return adj_data

def main():
    """Main function to normalize JSON fields"""
    print("🔄 Normalizing JSON fields (furigana/hiragana)...")
    
    # Normalize vocab.json
    print("📝 Processing vocab.json...")
    vocab_data = load_json("vocab.json")
    vocab_normalized = normalize_vocab_fields(vocab_data)
    save_json(vocab_normalized, "vocab.json")
    
    # Normalize verbs.json
    print("🔧 Processing verbs.json...")
    verbs_data = load_json("verbs.json")
    verbs_normalized = normalize_verb_fields(verbs_data)
    save_json(verbs_normalized, "verbs.json")
    
    # Normalize adjectives.json
    print("🎨 Processing adjectives.json...")
    adjectives_data = load_json("adjectives.json")
    adjectives_normalized = normalize_adjective_fields(adjectives_data)
    save_json(adjectives_normalized, "adjectives.json")
    
    print("✅ Field normalization complete!")
    print("📊 All JSON files now use consistent 'hiragana' field")

if __name__ == "__main__":
    main()
