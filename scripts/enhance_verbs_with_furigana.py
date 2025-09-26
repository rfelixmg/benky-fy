#!/usr/bin/env python3
"""
Script to enhance verbs.json with furigana support by analyzing kanji stems.
"""

import json
import re
from typing import Dict, List, Tuple

# Common verb endings and their readings
VERB_ENDINGS = {
    # Ichidan verbs (る-ending)
    'る': 'ru',
    'える': 'eru',  # 開ける, 閉める, etc.
    'いる': 'iru',  # いる (to exist)
    
    # Godan verbs (various endings)
    'く': 'ku',     # 歩く, 行く, etc.
    'ぐ': 'gu',     # 泳ぐ
    'す': 'su',     # 話す
    'つ': 'tsu',    # 待つ
    'ぬ': 'nu',     # 死ぬ
    'ぶ': 'bu',     # 呼ぶ
    'む': 'mu',     # 飲む, 読む
    'う': 'u',      # 会う, 歌う, etc.
    'る': 'ru',     # ある, なる, etc.
}

# Common kanji readings for verb roots
KANJI_READINGS = {
    '考': 'かんが',
    '開': 'あ',
    '閉': 'し',
    '寝': 'ね',
    '起': 'お',
    '歩': 'ある',
    '行': 'い',
    '話': 'はな',
    '言': 'い',
    '勉強': 'べんきょう',
    '買': 'か',
    '売': 'う',
    '覚': 'おぼ',
    '忘': 'わす',
    '見': 'み',
    '食': 'た',
    '飲': 'の',
    '聞': 'き',
    '走': 'はし',
    '乗': 'の',
    '働': 'はたら',
    'あげ': 'あげ',
    '置': 'お',
    '降': 'ふ',
    '歌': 'うた',
    '泣': 'な',
    '取': 'と',
    '電話': 'でんわ',
    '叫': 'さけ',
    '止': 'や',
    '始': 'はじ',
    '成': 'な',
    '生': 'う',
    'い': 'い',
    'あ': 'あ',
    '支払': 'しはら',
    '切': 'き',
    '調': 'しら',
    '見': 'み',
    '会': 'あ',
    '書': 'か',
    '撮': 'と',
    '待': 'ま',
    '分': 'わ',
}

def analyze_kanji_structure(kanji: str, hiragana: str, conjugation_type: str) -> Dict:
    """
    Analyze kanji structure and create furigana data.
    
    Args:
        kanji: The kanji form of the verb
        hiragana: The hiragana reading
        conjugation_type: Type of verb (godan, ichidan, irregular)
    
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
    
    # Handle irregular verbs (suru, kuru)
    if conjugation_type == "irregular":
        if kanji in ["為る", "する"]:
            stems.append({
                "kanji": "する",
                "reading": "する",
                "type": "irregular",
                "meaning": "to do",
                "position": 0,
                "length": 2
            })
            furigana_html_parts.append("する")
            furigana_text_parts.append("する")
        elif "勉強" in kanji:
            stems.append({
                "kanji": "勉強",
                "reading": "べんきょう",
                "type": "root",
                "meaning": "study",
                "position": 0,
                "length": 2
            })
            stems.append({
                "kanji": "する",
                "reading": "する",
                "type": "suffix",
                "meaning": "irregular verb ending",
                "position": 2,
                "length": 2
            })
            furigana_html_parts.append('<ruby>勉強<rt>べんきょう</rt></ruby>する')
            furigana_text_parts.append("勉強[べんきょう]する")
        elif "電話" in kanji:
            stems.append({
                "kanji": "電話",
                "reading": "でんわ",
                "type": "root",
                "meaning": "telephone",
                "position": 0,
                "length": 2
            })
            stems.append({
                "kanji": "する",
                "reading": "する",
                "type": "suffix",
                "meaning": "irregular verb ending",
                "position": 2,
                "length": 2
            })
            furigana_html_parts.append('<ruby>電話<rt>でんわ</rt></ruby>する')
            furigana_text_parts.append("電話[でんわ]する")
        else:
            # Generic irregular handling
            stems.append({
                "kanji": kanji,
                "reading": hiragana,
                "type": "irregular",
                "meaning": "irregular verb",
                "position": 0,
                "length": len(kanji)
            })
            furigana_html_parts.append(f'<ruby>{kanji}<rt>{hiragana}</rt></ruby>')
            furigana_text_parts.append(f"{kanji}[{hiragana}]")
    
    # Handle ichidan verbs (typically end in る)
    elif conjugation_type == "ichidan":
        if kanji.endswith('る'):
            root_kanji = kanji[:-1]
            root_hiragana = hiragana[:-2]  # Remove 'ru' from hiragana
            
            if root_kanji in KANJI_READINGS:
                root_reading = KANJI_READINGS[root_kanji]
            else:
                root_reading = root_hiragana
            
            stems.append({
                "kanji": root_kanji,
                "reading": root_reading,
                "type": "root",
                "meaning": "verb root",
                "position": 0,
                "length": len(root_kanji)
            })
            
            stems.append({
                "kanji": "る",
                "reading": "る",
                "type": "suffix",
                "meaning": "ichidan verb ending",
                "position": len(root_kanji),
                "length": 1
            })
            
            furigana_html_parts.append(f'<ruby>{root_kanji}<rt>{root_reading}</rt></ruby>る')
            furigana_text_parts.append(f"{root_kanji}[{root_reading}]る")
        else:
            # Fallback for non-standard ichidan verbs
            stems.append({
                "kanji": kanji,
                "reading": hiragana,
                "type": "ichidan",
                "meaning": "ichidan verb",
                "position": 0,
                "length": len(kanji)
            })
            furigana_html_parts.append(f'<ruby>{kanji}<rt>{hiragana}</rt></ruby>')
            furigana_text_parts.append(f"{kanji}[{hiragana}]")
    
    # Handle godan verbs
    elif conjugation_type == "godan":
        # Check if kanji contains hiragana characters (like 見つける)
        import re
        kanji_parts = re.findall(r'[一-龯]+|[あ-ん]+', kanji)
        
        if len(kanji_parts) >= 2:
            # Mixed kanji-hiragana case (e.g., 見つける)
            kanji_part = kanji_parts[0]  # 見
            hiragana_part = ''.join(kanji_parts[1:])  # つける
            
            # Find the reading for the kanji part
            if kanji_part in KANJI_READINGS:
                kanji_reading = KANJI_READINGS[kanji_part]
            else:
                # Extract reading from hiragana (match length of kanji part)
                kanji_reading = hiragana[:len(kanji_part)]
            
            stems.append({
                "kanji": kanji_part,
                "reading": kanji_reading,
                "type": "root",
                "meaning": "verb root",
                "position": 0,
                "length": len(kanji_part)
            })
            
            stems.append({
                "kanji": hiragana_part,
                "reading": hiragana_part,
                "type": "suffix",
                "meaning": "verb suffix",
                "position": len(kanji_part),
                "length": len(hiragana_part)
            })
            
            furigana_html_parts.append(f'<ruby>{kanji_part}<rt>{kanji_reading}</rt></ruby>{hiragana_part}')
            furigana_text_parts.append(f"{kanji_part}[{kanji_reading}]{hiragana_part}")
            
        elif len(kanji) >= 2:
            # Pure kanji case (e.g., 食べる -> たべる)
            root_kanji = kanji[:-1]
            ending_kanji = kanji[-1]
            
            # Try to find root reading
            if root_kanji in KANJI_READINGS:
                root_reading = KANJI_READINGS[root_kanji]
            else:
                # Extract root from hiragana (remove last mora)
                root_hiragana = hiragana[:-1]
                root_reading = root_hiragana
            
            stems.append({
                "kanji": root_kanji,
                "reading": root_reading,
                "type": "root",
                "meaning": "verb root",
                "position": 0,
                "length": len(root_kanji)
            })
            
            stems.append({
                "kanji": ending_kanji,
                "reading": hiragana[-1],
                "type": "suffix",
                "meaning": "godan verb ending",
                "position": len(root_kanji),
                "length": 1
            })
            
            furigana_html_parts.append(f'<ruby>{root_kanji}<rt>{root_reading}</rt></ruby>{ending_kanji}')
            furigana_text_parts.append(f"{root_kanji}[{root_reading}]{ending_kanji}")
        else:
            # Single character godan verbs
            stems.append({
                "kanji": kanji,
                "reading": hiragana,
                "type": "godan",
                "meaning": "godan verb",
                "position": 0,
                "length": len(kanji)
            })
            furigana_html_parts.append(f'<ruby>{kanji}<rt>{hiragana}</rt></ruby>')
            furigana_text_parts.append(f"{kanji}[{hiragana}]")
    
    else:
        # Fallback for unknown conjugation types
        stems.append({
            "kanji": kanji,
            "reading": hiragana,
            "type": "unknown",
            "meaning": "verb",
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

def enhance_verbs_with_furigana(input_file: str, output_file: str):
    """
    Enhance verbs.json with furigana analysis.
    
    Args:
        input_file: Path to input verbs.json
        output_file: Path to output enhanced verbs.json
    """
    print(f"Loading verbs from {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        verbs = json.load(f)
    
    print(f"Processing {len(verbs)} verbs...")
    
    enhanced_verbs = []
    
    for i, verb in enumerate(verbs):
        print(f"Processing verb {i+1}/{len(verbs)}: {verb['english']} ({verb['kanji']})")
        
        # Analyze kanji structure
        kanji_analysis = analyze_kanji_structure(
            verb['kanji'],
            verb['hiragana'],
            verb.get('conjugation', verb.get('grammatical_type', 'unknown'))
        )
        
        # Add kanji analysis to verb data
        enhanced_verb = verb.copy()
        enhanced_verb['kanji_analysis'] = kanji_analysis
        
        enhanced_verbs.append(enhanced_verb)
    
    print(f"Saving enhanced verbs to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enhanced_verbs, f, ensure_ascii=False, indent=2)
    
    print("Enhancement complete!")
    print(f"Enhanced {len(enhanced_verbs)} verbs with furigana support.")

if __name__ == "__main__":
    import sys
    
    input_file = "datum/verbs.json"
    output_file = "datum/verbs.json"  # Overwrite original
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    enhance_verbs_with_furigana(input_file, output_file)
