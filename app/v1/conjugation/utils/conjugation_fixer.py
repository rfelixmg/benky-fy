"""Verb and adjective conjugation data fixer utility."""

import json
import os
from typing import Dict, List, Any


class ConjugationFixer:
    """Utility class to fix and complete verb and adjective conjugation data"""
    
    def __init__(self, verbs_file_path: str, adjectives_file_path: str):
        self.verbs_file_path = verbs_file_path
        self.adjectives_file_path = adjectives_file_path
        self.verbs = self.load_data(verbs_file_path)
        self.adjectives = self.load_data(adjectives_file_path)
    
    def load_data(self, file_path: str) -> List[Dict[str, Any]]:
        """Load data from JSON file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save_data(self, data: List[Dict[str, Any]], file_path: str):
        """Save data back to JSON file"""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def fix_verb_polite_forms(self):
        """Fix incorrect polite forms for verbs"""
        fixes = {
            # Irregular verbs
            "する": {"polite": {"kanji": "します", "hiragana": "します"}},
            "勉強する": {"polite": {"kanji": "勉強します", "hiragana": "べんきょうします"}},
            "電話する": {"polite": {"kanji": "電話します", "hiragana": "でんわします"}},
            
            # Godan verbs
            "歩く": {"polite": {"kanji": "歩きます", "hiragana": "あるきます"}},
            "行く": {"polite": {"kanji": "行きます", "hiragana": "いきます"}},
            "話す": {"polite": {"kanji": "話します", "hiragana": "はなします"}},
            "言う": {"polite": {"kanji": "言います", "hiragana": "いいます"}},
            "買う": {"polite": {"kanji": "買います", "hiragana": "かいます"}},
            "売る": {"polite": {"kanji": "売ります", "hiragana": "うります"}},
            "飲む": {"polite": {"kanji": "飲みます", "hiragana": "のみます"}},
            "聞く": {"polite": {"kanji": "聞きます", "hiragana": "ききます"}},
            "走る": {"polite": {"kanji": "走ります", "hiragana": "はしります"}},
            "乗る": {"polite": {"kanji": "乗ります", "hiragana": "のります"}},
            "働く": {"polite": {"kanji": "働きます", "hiragana": "はたらきます"}},
            "置く": {"polite": {"kanji": "置きます", "hiragana": "おきます"}},
            "降る": {"polite": {"kanji": "降ります", "hiragana": "ふります"}},
            "歌う": {"polite": {"kanji": "歌います", "hiragana": "うたいます"}},
            "泣く": {"polite": {"kanji": "泣きます", "hiragana": "なきます"}},
            "取る": {"polite": {"kanji": "取ります", "hiragana": "とります"}},
            "叫ぶ": {"polite": {"kanji": "叫びます", "hiragana": "さけびます"}},
            "なる": {"polite": {"kanji": "なります", "hiragana": "なります"}},
            "ある": {"polite": {"kanji": "あります", "hiragana": "あります"}},
            "支払う": {"polite": {"kanji": "支払います", "hiragana": "しはらいます"}},
            "切る": {"polite": {"kanji": "切ります", "hiragana": "きります"}},
            "会う": {"polite": {"kanji": "会います", "hiragana": "あいます"}},
            "書く": {"polite": {"kanji": "書きます", "hiragana": "かきます"}},
            "撮る": {"polite": {"kanji": "撮ります", "hiragana": "とります"}},
            "待つ": {"polite": {"kanji": "待ちます", "hiragana": "まちます"}},
            "分かる": {"polite": {"kanji": "分かります", "hiragana": "わかります"}},
        }
        
        for verb in self.verbs:
            hiragana = verb.get('hiragana', '')
            if hiragana in fixes:
                verb['conjugations'].update(fixes[hiragana])
    
    def fix_adjective_conjugations(self):
        """Fix and complete adjective conjugations"""
        for adjective in self.adjectives:
            conjugations = adjective.get('conjugations', {})
            conjugation_type = adjective.get('conjugation_type', '')
            hiragana = adjective.get('hiragana', '')
            kanji = adjective.get('kanji', '')
            
            if conjugation_type == 'i_adjective':
                self._complete_i_adjective_conjugations(adjective, conjugations, hiragana, kanji)
            elif conjugation_type == 'na_adjective':
                self._complete_na_adjective_conjugations(adjective, conjugations, hiragana, kanji)
            elif conjugation_type == 'i_adjective_irregular':
                self._complete_irregular_i_adjective_conjugations(adjective, conjugations, hiragana, kanji)
    
    def complete_verb_conjugations(self):
        """Complete missing core conjugation forms for all verbs"""
        for verb in self.verbs:
            conjugations = verb.get('conjugations', {})
            conjugation_type = verb.get('conjugation', '')
            hiragana = verb.get('hiragana', '')
            kanji = verb.get('kanji', '')
            
            # Skip if already has all forms
            if all(form in conjugations for form in ['negative', 'polite_negative', 'past', 'polite_past', 'past_negative']):
                continue
            
            if conjugation_type == 'godan':
                self._complete_godan_conjugations(verb, conjugations, hiragana, kanji)
            elif conjugation_type == 'ichidan':
                self._complete_ichidan_conjugations(verb, conjugations, hiragana, kanji)
            elif conjugation_type == 'irregular':
                self._complete_irregular_conjugations(verb, conjugations, hiragana, kanji)
    
    def _complete_i_adjective_conjugations(self, adjective: Dict, conjugations: Dict, hiragana: str, kanji: str):
        """Complete i-adjective conjugations"""
        if len(hiragana) < 2 or not hiragana.endswith('い'):
            return
        
        stem = hiragana[:-1]
        kanji_stem = kanji[:-1] if len(kanji) > 1 else kanji
        
        # Add missing forms if not present
        if 'past' not in conjugations:
            conjugations['past'] = {
                'kanji': kanji_stem + 'かった',
                'hiragana': stem + 'かった',
                'romaji': stem + 'katta'
            }
        
        if 'negative' not in conjugations:
            conjugations['negative'] = {
                'kanji': kanji_stem + 'くない',
                'hiragana': stem + 'くない',
                'romaji': stem + 'kunai'
            }
        
        if 'negative_past' not in conjugations:
            conjugations['negative_past'] = {
                'kanji': kanji_stem + 'くなかった',
                'hiragana': stem + 'くなかった',
                'romaji': stem + 'kunakatta'
            }
        
        if 'adverbial' not in conjugations:
            conjugations['adverbial'] = {
                'kanji': kanji_stem + 'く',
                'hiragana': stem + 'く',
                'romaji': stem + 'ku'
            }
    
    def _complete_na_adjective_conjugations(self, adjective: Dict, conjugations: Dict, hiragana: str, kanji: str):
        """Complete na-adjective conjugations"""
        # Add missing forms if not present
        if 'past' not in conjugations:
            conjugations['past'] = {
                'kanji': kanji + 'だった',
                'hiragana': hiragana + 'だった',
                'romaji': hiragana + ' datta'
            }
        
        if 'negative' not in conjugations:
            conjugations['negative'] = {
                'kanji': kanji + 'ではない',
                'hiragana': hiragana + 'ではない',
                'romaji': hiragana + ' dewa nai'
            }
        
        if 'negative_past' not in conjugations:
            conjugations['negative_past'] = {
                'kanji': kanji + 'ではなかった',
                'hiragana': hiragana + 'ではなかった',
                'romaji': hiragana + ' dewa nakatta'
            }
        
        if 'adverbial' not in conjugations:
            conjugations['adverbial'] = {
                'kanji': kanji + 'に',
                'hiragana': hiragana + 'に',
                'romaji': hiragana + ' ni'
            }
    
    def _complete_irregular_i_adjective_conjugations(self, adjective: Dict, conjugations: Dict, hiragana: str, kanji: str):
        """Complete irregular i-adjective conjugations (like いい)"""
        if hiragana == 'いい':
            # Special case for いい (good)
            conjugations.update({
                'past': {'kanji': 'よかった', 'hiragana': 'よかった', 'romaji': 'yokatta'},
                'negative': {'kanji': '良くない', 'hiragana': 'よくない', 'romaji': 'yokunai'},
                'negative_past': {'kanji': 'よくなかった', 'hiragana': 'よくなかった', 'romaji': 'yokunakatta'},
                'adverbial': {'kanji': '良く', 'hiragana': 'よく', 'romaji': 'yoku'}
            })
    
    def _complete_godan_conjugations(self, verb: Dict, conjugations: Dict, hiragana: str, kanji: str):
        """Complete godan verb conjugations"""
        # Extract stem and ending
        if len(hiragana) < 2:
            return
        
        stem = hiragana[:-1]
        ending = hiragana[-1]
        
        # Get kanji stem (everything except last character)
        kanji_stem = kanji[:-1] if len(kanji) > 1 else kanji
        
        # Conjugation mappings for godan verbs
        conjugation_map = {
            'く': {'i': 'き', 'a': 'か', 'ta': 'いた', 'te': 'いて'},
            'ぐ': {'i': 'ぎ', 'a': 'が', 'ta': 'いだ', 'te': 'いで'},
            'す': {'i': 'し', 'a': 'さ', 'ta': 'した', 'te': 'して'},
            'つ': {'i': 'ち', 'a': 'た', 'ta': 'った', 'te': 'って'},
            'ぬ': {'i': 'に', 'a': 'な', 'ta': 'んだ', 'te': 'んで'},
            'ぶ': {'i': 'び', 'a': 'ば', 'ta': 'んだ', 'te': 'んで'},
            'む': {'i': 'み', 'a': 'ま', 'ta': 'んだ', 'te': 'んで'},
            'る': {'i': 'り', 'a': 'ら', 'ta': 'った', 'te': 'って'},
            'う': {'i': 'い', 'a': 'わ', 'ta': 'った', 'te': 'って'},
        }
        
        if ending not in conjugation_map:
            return
        
        forms = conjugation_map[ending]
        
        # Add missing forms
        if 'negative' not in conjugations:
            conjugations['negative'] = {
                'kanji': kanji_stem + forms['a'] + 'ない',
                'hiragana': stem + forms['a'] + 'ない'
            }
        
        if 'polite_negative' not in conjugations:
            conjugations['polite_negative'] = {
                'kanji': kanji_stem + forms['i'] + 'ません',
                'hiragana': stem + forms['i'] + 'ません'
            }
        
        if 'past' not in conjugations:
            conjugations['past'] = {
                'kanji': kanji_stem + forms['ta'],
                'hiragana': stem + forms['ta']
            }
        
        if 'polite_past' not in conjugations:
            conjugations['polite_past'] = {
                'kanji': kanji_stem + forms['i'] + 'ました',
                'hiragana': stem + forms['i'] + 'ました'
            }
        
        if 'past_negative' not in conjugations:
            conjugations['past_negative'] = {
                'kanji': kanji_stem + forms['a'] + 'なかった',
                'hiragana': stem + forms['a'] + 'なかった'
            }
    
    def _complete_ichidan_conjugations(self, verb: Dict, conjugations: Dict, hiragana: str, kanji: str):
        """Complete ichidan verb conjugations"""
        if len(hiragana) < 2 or not hiragana.endswith('る'):
            return
        
        stem = hiragana[:-1]
        kanji_stem = kanji[:-1] if len(kanji) > 1 else kanji
        
        # Add missing forms
        if 'negative' not in conjugations:
            conjugations['negative'] = {
                'kanji': kanji_stem + 'ない',
                'hiragana': stem + 'ない'
            }
        
        if 'polite_negative' not in conjugations:
            conjugations['polite_negative'] = {
                'kanji': kanji_stem + 'ません',
                'hiragana': stem + 'ません'
            }
        
        if 'past' not in conjugations:
            conjugations['past'] = {
                'kanji': kanji_stem + 'た',
                'hiragana': stem + 'た'
            }
        
        if 'polite_past' not in conjugations:
            conjugations['polite_past'] = {
                'kanji': kanji_stem + 'ました',
                'hiragana': stem + 'ました'
            }
        
        if 'past_negative' not in conjugations:
            conjugations['past_negative'] = {
                'kanji': kanji_stem + 'なかった',
                'hiragana': stem + 'なかった'
            }
    
    def _complete_irregular_conjugations(self, verb: Dict, conjugations: Dict, hiragana: str, kanji: str):
        """Complete irregular verb conjugations"""
        if 'する' in hiragana:
            # Suru verbs
            if hiragana == 'する':
                conjugations.update({
                    'negative': {'kanji': 'しない', 'hiragana': 'しない'},
                    'polite_negative': {'kanji': 'しません', 'hiragana': 'しません'},
                    'past': {'kanji': 'した', 'hiragana': 'した'},
                    'polite_past': {'kanji': 'しました', 'hiragana': 'しました'},
                    'past_negative': {'kanji': 'しなかった', 'hiragana': 'しなかった'}
                })
            else:
                # Compound suru verbs
                stem = hiragana.replace('する', '')
                kanji_stem = kanji.replace('する', '')
                
                conjugations.update({
                    'negative': {'kanji': kanji_stem + 'しない', 'hiragana': stem + 'しない'},
                    'polite_negative': {'kanji': kanji_stem + 'しません', 'hiragana': stem + 'しません'},
                    'past': {'kanji': kanji_stem + 'した', 'hiragana': stem + 'した'},
                    'polite_past': {'kanji': kanji_stem + 'しました', 'hiragana': stem + 'しました'},
                    'past_negative': {'kanji': kanji_stem + 'しなかった', 'hiragana': stem + 'しなかった'}
                })
    
    def fix_all_conjugations(self):
        """Fix all conjugation issues for both verbs and adjectives"""
        print("Fixing verb polite forms...")
        self.fix_verb_polite_forms()
        
        print("Completing verb conjugations...")
        self.complete_verb_conjugations()
        
        print("Fixing adjective conjugations...")
        self.fix_adjective_conjugations()
        
        print("Saving updated verbs...")
        self.save_data(self.verbs, self.verbs_file_path)
        
        print("Saving updated adjectives...")
        self.save_data(self.adjectives, self.adjectives_file_path)
        
        print("✅ All conjugations fixed!")


def main():
    """Main function to fix verb and adjective conjugations"""
    verbs_file = os.path.join(os.path.dirname(__file__), '../../../datum/verbs.json')
    adjectives_file = os.path.join(os.path.dirname(__file__), '../../../datum/adjectives.json')
    fixer = ConjugationFixer(verbs_file, adjectives_file)
    fixer.fix_all_conjugations()


if __name__ == '__main__':
    main()
