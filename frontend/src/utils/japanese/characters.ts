import { Script } from '../../types/japanese';

const HIRAGANA_RANGE = /[\u3040-\u309F]/;
const KATAKANA_RANGE = /[\u30A0-\u30FF]/;
const KANJI_RANGE = /[\u4E00-\u9FAF]/;
const JAPANESE_PUNCTUATION = /[\u3000-\u303F]/;
const JAPANESE_SYMBOLS = /[\u31F0-\u31FF\u3220-\u3243\u3280-\u32B0]/;

export function isHiragana(char: string): boolean {
  return HIRAGANA_RANGE.test(char);
}

export function isKatakana(char: string): boolean {
  return KATAKANA_RANGE.test(char);
}

export function isKanji(char: string): boolean {
  return KANJI_RANGE.test(char);
}

export function isJapanesePunctuation(char: string): boolean {
  return JAPANESE_PUNCTUATION.test(char);
}

export function isJapaneseSymbol(char: string): boolean {
  return JAPANESE_SYMBOLS.test(char);
}

export function isJapaneseCharacter(char: string): boolean {
  return (
    isHiragana(char) ||
    isKatakana(char) ||
    isKanji(char) ||
    isJapanesePunctuation(char) ||
    isJapaneseSymbol(char)
  );
}

export function getCharacterType(char: string): Script | 'punctuation' | 'symbol' | 'other' {
  if (isHiragana(char)) return 'hiragana';
  if (isKatakana(char)) return 'katakana';
  if (isKanji(char)) return 'kanji';
  if (isJapanesePunctuation(char)) return 'punctuation';
  if (isJapaneseSymbol(char)) return 'symbol';
  return 'other';
}

export function containsScript(text: string, script: Script): boolean {
  const chars = Array.from(text);
  switch (script) {
    case 'hiragana':
      return chars.some(isHiragana);
    case 'katakana':
      return chars.some(isKatakana);
    case 'kanji':
      return chars.some(isKanji);
    case 'romaji':
      return /[a-zA-Z]/.test(text);
    default:
      return false;
  }
}

export function validateScript(text: string, script: Script): boolean {
  const chars = Array.from(text);
  switch (script) {
    case 'hiragana':
      return chars.every(char => isHiragana(char) || isJapanesePunctuation(char));
    case 'katakana':
      return chars.every(char => isKatakana(char) || isJapanesePunctuation(char));
    case 'kanji':
      return chars.every(char => isKanji(char) || isJapanesePunctuation(char));
    case 'romaji':
      return /^[a-zA-Z\s\-']*$/.test(text);
    default:
      return false;
  }
}
