#!/usr/bin/env python3
"""
Enhance adjectives.json with furigana support similar to verbs.json
"""

import json
import re
from typing import Dict, Any, List

def kanji_to_hiragana_mapping():
    """Basic kanji to hiragana mapping for common characters"""
    return {
        '大': 'だい', '変': 'へん', '楽': 'たの', '難': 'むずか', '簡': 'かん', '単': 'たん',
        '忙': 'いそが', '静': 'しず', '有': 'ゆう', '名': 'めい', '親': 'しん', '切': 'せつ',
        '元': 'げん', '気': 'き', '便': 'べん', '利': 'り', '近': 'ちか', '遠': 'とお',
        '新': 'あたら', '古': 'ふる', '多': 'おお', '少': 'すく', '重': 'おも', '軽': 'かる',
        '広': 'ひろ', '狭': 'せま', '甘': 'あま', '辛': 'から', '苦': 'にが', '塩': 'しょっぱ',
        '酸': 'すっぱ', '悪': 'わる', '大': 'おお', '小': 'ちい', '熱': 'あつ', '寒': 'さむ',
        '面': 'おもしろ', '白': 'しろ', '高': 'たか', '安': 'やす', '速': 'はや', '遅': 'おそ'
    }

def analyze_kanji_structure_adjective(kanji: str, hiragana: str) -> Dict:
    """
    Analyze kanji structure for adjectives and create proper furigana data.
    
    Args:
        kanji: The kanji form of the adjective
        hiragana: The hiragana reading
    
    Returns:
        Dictionary with kanji analysis data
    """
    if not kanji or not hiragana:
        return {
            "stems": [],
            "furigana_html": kanji,
            "furigana_text": kanji
        }
    
    stems = []
    furigana_html_parts = []
    furigana_text_parts = []
    
    # Check if kanji contains hiragana characters (like 楽しい)
    import re
    kanji_parts = re.findall(r'[一-龯]+|[あ-ん]+', kanji)
    
    if len(kanji_parts) >= 2:
        # Mixed kanji-hiragana case (e.g., 楽しい)
        kanji_part = kanji_parts[0]  # 楽
        hiragana_part = ''.join(kanji_parts[1:])  # しい
        
        # Find the reading for the kanji part
        if kanji_part in kanji_to_hiragana_mapping():
            kanji_reading = kanji_to_hiragana_mapping()[kanji_part]
        else:
            # Extract reading from hiragana (match length of kanji part)
            kanji_reading = hiragana[:len(kanji_part)]
        
        stems.append({
            "kanji": kanji_part,
            "reading": kanji_reading,
            "type": "root",
            "meaning": "adjective root",
            "position": 0,
            "length": len(kanji_part)
        })
        
        stems.append({
            "kanji": hiragana_part,
            "reading": hiragana_part,
            "type": "suffix",
            "meaning": "adjective suffix",
            "position": len(kanji_part),
            "length": len(hiragana_part)
        })
        
        furigana_html_parts.append(f'<ruby>{kanji_part}<rt>{kanji_reading}</rt></ruby>{hiragana_part}')
        furigana_text_parts.append(f"{kanji_part}[{kanji_reading}]{hiragana_part}")
        
    elif len(kanji) >= 2:
        # Pure kanji case (e.g., 大変 -> たいへん)
        # Try to split into individual kanji characters
        kanji_chars = list(kanji)
        hiragana_chars = list(hiragana)
        
        if len(kanji_chars) == len(hiragana_chars):
            # One-to-one mapping (e.g., 大変 -> たいへん)
            for i, (k_char, h_char) in enumerate(zip(kanji_chars, hiragana_chars)):
                stems.append({
                    "kanji": k_char,
                    "reading": h_char,
                    "type": "root" if i == 0 else "compound",
                    "meaning": "adjective component",
                    "position": i,
                    "length": 1
                })
                furigana_html_parts.append(f'<ruby>{k_char}<rt>{h_char}</rt></ruby>')
                furigana_text_parts.append(f"{k_char}[{h_char}]")
        else:
            # Complex mapping - use the mapping dictionary
            if kanji in kanji_to_hiragana_mapping():
                reading = kanji_to_hiragana_mapping()[kanji]
                stems.append({
                    "kanji": kanji,
                    "reading": reading,
                    "type": "compound",
                    "meaning": "adjective",
                    "position": 0,
                    "length": len(kanji)
                })
                furigana_html_parts.append(f'<ruby>{kanji}<rt>{reading}</rt></ruby>')
                furigana_text_parts.append(f"{kanji}[{reading}]")
            else:
                # Fallback - use entire hiragana reading
                stems.append({
                    "kanji": kanji,
                    "reading": hiragana,
                    "type": "compound",
                    "meaning": "adjective",
                    "position": 0,
                    "length": len(kanji)
                })
                furigana_html_parts.append(f'<ruby>{kanji}<rt>{hiragana}</rt></ruby>')
                furigana_text_parts.append(f"{kanji}[{hiragana}]")
    else:
        # Single character
        stems.append({
            "kanji": kanji,
            "reading": hiragana,
            "type": "adjective",
            "meaning": "adjective",
            "position": 0,
            "length": len(kanji)
        })
        furigana_html_parts.append(f'<ruby>{kanji}<rt>{hiragana}</rt></ruby>')
        furigana_text_parts.append(f"{kanji}[{hiragana}]")
    
    return {
        "stems": stems,
        "furigana_html": "".join(furigana_html_parts),
        "furigana_text": "".join(furigana_text_parts)
    }

def generate_furigana_for_adjective(adj: Dict[str, Any]) -> Dict[str, Any]:
    """Generate furigana data for an adjective"""
    kanji = adj.get('kanji', '')
    hiragana = adj.get('hiragana', '')
    
    if not kanji or not hiragana:
        return adj
    
    # Use proper kanji analysis
    kanji_analysis = analyze_kanji_structure_adjective(kanji, hiragana)
    
    # Add furigana data to adjective
    enhanced_adj = adj.copy()
    enhanced_adj["kanji_analysis"] = kanji_analysis
    enhanced_adj["furigana_html"] = kanji_analysis["furigana_html"]
    enhanced_adj["furigana_text"] = kanji_analysis["furigana_text"]
    
    return enhanced_adj

def enhance_adjectives_with_furigana(input_file: str, output_file: str = None):
    """Enhance adjectives with furigana data"""
    if output_file is None:
        output_file = input_file
    
    print(f"Loading adjectives from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        adjectives = json.load(f)
    
    print(f"Enhancing {len(adjectives)} adjectives with furigana data...")
    enhanced_adjectives = []
    
    for i, adj in enumerate(adjectives):
        try:
            enhanced_adj = generate_furigana_for_adjective(adj)
            enhanced_adjectives.append(enhanced_adj)
            
            if (i + 1) % 10 == 0:
                print(f"Processed {i + 1}/{len(adjectives)} adjectives...")
                
        except Exception as e:
            print(f"Error processing adjective {i}: {adj.get('english', 'unknown')} - {e}")
            # Add original adjective without furigana data
            enhanced_adjectives.append(adj)
    
    print(f"Saving enhanced adjectives to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enhanced_adjectives, f, ensure_ascii=False, indent=2)
    
    print("✅ Furigana enhancement complete!")
    return enhanced_adjectives

if __name__ == "__main__":
    input_file = "datum/adjectives.json"
    
    # Create backup
    backup_file = "datum/adjectives.json.backup2"
    print(f"Creating backup: {backup_file}")
    
    import shutil
    shutil.copy2(input_file, backup_file)
    
    # Enhance adjectives
    enhanced_adjectives = enhance_adjectives_with_furigana(input_file)
    
    print(f"\n✅ All done! Backup saved to {backup_file}")
    print("Adjectives now have furigana support!")
