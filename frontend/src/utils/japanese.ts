import { Script, ConversionOptions } from '../types/japanese';
import { convertToHiragana } from './japanese/hiragana';
import { convertToKatakana } from './japanese/katakana';

export class JapaneseText {
  private static readonly HIRAGANA_RANGE = /[\u3040-\u309F]/;
  private static readonly KATAKANA_RANGE = /[\u30A0-\u30FF]/;
  private static readonly KANJI_RANGE = /[\u4E00-\u9FAF]/;

  static isHiragana(char: string): boolean {
    return this.HIRAGANA_RANGE.test(char);
  }

  static isKatakana(char: string): boolean {
    return this.KATAKANA_RANGE.test(char);
  }

  static isKanji(char: string): boolean {
    return this.KANJI_RANGE.test(char);
  }

  static convert(text: string, options: ConversionOptions): string {
    if (!text) return '';
    
    const { script, allowPartial = false } = options;
    text = text.toLowerCase().trim();
    
    switch (script) {
      case 'hiragana':
        return convertToHiragana(text, allowPartial);
      case 'katakana':
        return convertToKatakana(text, allowPartial);
      default:
        return text;
    }
  }

  static isValid(text: string, script?: Script): boolean {
    if (!text) return false;
    if (!script) return true;

    const chars = Array.from(text);
    switch (script) {
      case 'hiragana':
        return chars.every(char => this.isHiragana(char));
      case 'katakana':
        return chars.every(char => this.isKatakana(char));
      case 'kanji':
        return chars.every(char => this.isKanji(char));
      default:
        return true;
    }
  }
}