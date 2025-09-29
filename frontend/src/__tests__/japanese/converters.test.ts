import { convertToHiragana } from '../../utils/japanese/hiragana';
import { convertToKatakana } from '../../utils/japanese/katakana';
import { JapaneseText } from '../../utils/japanese';
import {
  isHiragana,
  isKatakana,
  isKanji,
  containsScript,
  validateScript,
} from '../../utils/japanese/characters';

describe('Japanese Text Converters', () => {
  describe('Hiragana Conversion', () => {
    it('converts basic romaji to hiragana', () => {
      expect(convertToHiragana('aiueo')).toBe('あいうえお');
      expect(convertToHiragana('kakikukeko')).toBe('かきくけこ');
      expect(convertToHiragana('sashisuseso')).toBe('さしすせそ');
    });

    it('handles double consonants correctly', () => {
      expect(convertToHiragana('kappa')).toBe('かっぱ');
      expect(convertToHiragana('motto')).toBe('もっと');
      expect(convertToHiragana('gakkou')).toBe('がっこう');
    });

    it('handles long vowels', () => {
      expect(convertToHiragana('toukyou')).toBe('とうきょう');
      expect(convertToHiragana('okaasan')).toBe('おかあさん');
      expect(convertToHiragana('oneesan')).toBe('おねえさん');
    });

    it('handles partial input when allowed', () => {
      expect(convertToHiragana('ka', true)).toBe('か');
      expect(convertToHiragana('kyo', true)).toBe('きょ');
      expect(convertToHiragana('kon', true)).toBe('こん');
    });
  });

  describe('Katakana Conversion', () => {
    it('converts basic romaji to katakana', () => {
      expect(convertToKatakana('aiueo')).toBe('アイウエオ');
      expect(convertToKatakana('kakikukeko')).toBe('カキクケコ');
      expect(convertToKatakana('sashisuseso')).toBe('サシスセソ');
    });

    it('handles double consonants correctly', () => {
      expect(convertToKatakana('kappa')).toBe('カッパ');
      expect(convertToKatakana('motto')).toBe('モット');
      expect(convertToKatakana('gakkou')).toBe('ガッコウ');
    });

    it('handles long vowels', () => {
      expect(convertToKatakana('toukyou')).toBe('トウキョウ');
      expect(convertToKatakana('koohii')).toBe('コーヒー');
      expect(convertToKatakana('suupaa')).toBe('スーパー');
    });

    it('handles partial input when allowed', () => {
      expect(convertToKatakana('ka', true)).toBe('カ');
      expect(convertToKatakana('kyo', true)).toBe('キョ');
      expect(convertToKatakana('kon', true)).toBe('コン');
    });
  });

  describe('Character Type Detection', () => {
    it('correctly identifies hiragana', () => {
      expect(isHiragana('あ')).toBe(true);
      expect(isHiragana('ア')).toBe(false);
      expect(isHiragana('漢')).toBe(false);
    });

    it('correctly identifies katakana', () => {
      expect(isKatakana('ア')).toBe(true);
      expect(isKatakana('あ')).toBe(false);
      expect(isKatakana('漢')).toBe(false);
    });

    it('correctly identifies kanji', () => {
      expect(isKanji('漢')).toBe(true);
      expect(isKanji('あ')).toBe(false);
      expect(isKanji('ア')).toBe(false);
    });
  });

  describe('Script Validation', () => {
    it('detects script presence correctly', () => {
      expect(containsScript('こんにちは', 'hiragana')).toBe(true);
      expect(containsScript('コンニチハ', 'katakana')).toBe(true);
      expect(containsScript('今日', 'kanji')).toBe(true);
      expect(containsScript('hello', 'romaji')).toBe(true);
    });

    it('validates script correctly', () => {
      expect(validateScript('こんにちは', 'hiragana')).toBe(true);
      expect(validateScript('コンニチハ', 'katakana')).toBe(true);
      expect(validateScript('今日', 'kanji')).toBe(true);
      expect(validateScript('hello', 'romaji')).toBe(true);
    });

    it('handles mixed scripts correctly', () => {
      expect(validateScript('こんにちはコンニチハ', 'hiragana')).toBe(false);
      expect(validateScript('コンニチハこんにちは', 'katakana')).toBe(false);
      expect(validateScript('今日は', 'kanji')).toBe(false);
    });
  });

  describe('JapaneseText Class', () => {
    it('converts text to specified script', () => {
      expect(JapaneseText.convert('konnichiwa', { script: 'hiragana' }))
        .toBe('こんにちわ');
      expect(JapaneseText.convert('konnichiwa', { script: 'katakana' }))
        .toBe('コンニチワ');
    });

    it('validates text against script', () => {
      expect(JapaneseText.isValid('こんにちは', 'hiragana')).toBe(true);
      expect(JapaneseText.isValid('コンニチハ', 'katakana')).toBe(true);
      expect(JapaneseText.isValid('今日', 'kanji')).toBe(true);
    });

    it('handles empty input', () => {
      expect(JapaneseText.convert('', { script: 'hiragana' })).toBe('');
      expect(JapaneseText.convert('', { script: 'katakana' })).toBe('');
      expect(JapaneseText.isValid('', 'hiragana')).toBe(false);
    });
  });
});
