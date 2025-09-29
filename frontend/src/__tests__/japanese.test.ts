import { JapaneseText } from '../utils/japanese';

describe('JapaneseText', () => {
  describe('character type detection', () => {
    it('correctly identifies hiragana', () => {
      expect(JapaneseText.isHiragana('あ')).toBe(true);
      expect(JapaneseText.isHiragana('ア')).toBe(false);
      expect(JapaneseText.isHiragana('漢')).toBe(false);
    });

    it('correctly identifies katakana', () => {
      expect(JapaneseText.isKatakana('ア')).toBe(true);
      expect(JapaneseText.isKatakana('あ')).toBe(false);
      expect(JapaneseText.isKatakana('漢')).toBe(false);
    });

    it('correctly identifies kanji', () => {
      expect(JapaneseText.isKanji('漢')).toBe(true);
      expect(JapaneseText.isKanji('あ')).toBe(false);
      expect(JapaneseText.isKanji('ア')).toBe(false);
    });
  });

  describe('text conversion', () => {
    it('handles empty input', () => {
      expect(JapaneseText.convert('', { script: 'hiragana' })).toBe('');
    });

    it('preserves input when script is not supported', () => {
      expect(JapaneseText.convert('test', { script: 'kanji' })).toBe('test');
    });
  });
});
