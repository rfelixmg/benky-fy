import { RomajiChar, JapaneseChar } from '../../types/japanese';

export const romajiToKatakana: Record<RomajiChar, JapaneseChar> = {
  'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ',
  'ka': 'カ', 'ki': 'キ', 'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',
  'ga': 'ガ', 'gi': 'ギ', 'gu': 'グ', 'ge': 'ゲ', 'go': 'ゴ',
  'sa': 'サ', 'shi': 'シ', 'su': 'ス', 'se': 'セ', 'so': 'ソ',
  'za': 'ザ', 'ji': 'ジ', 'zu': 'ズ', 'ze': 'ゼ', 'zo': 'ゾ',
  'ta': 'タ', 'chi': 'チ', 'tsu': 'ツ', 'te': 'テ', 'to': 'ト',
  'da': 'ダ', 'di': 'ヂ', 'du': 'ヅ', 'de': 'デ', 'do': 'ド',
  'na': 'ナ', 'ni': 'ニ', 'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ',
  'ha': 'ハ', 'hi': 'ヒ', 'fu': 'フ', 'he': 'ヘ', 'ho': 'ホ',
  'ba': 'バ', 'bi': 'ビ', 'bu': 'ブ', 'be': 'ベ', 'bo': 'ボ',
  'pa': 'パ', 'pi': 'ピ', 'pu': 'プ', 'pe': 'ペ', 'po': 'ポ',
  'ma': 'マ', 'mi': 'ミ', 'mu': 'ム', 'me': 'メ', 'mo': 'モ',
  'ya': 'ヤ', 'yu': 'ユ', 'yo': 'ヨ',
  'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
  'wa': 'ワ', 'wi': 'ヰ', 'we': 'ヱ', 'wo': 'ヲ',
  'n': 'ン',
  // Common combinations
  'kya': 'キャ', 'kyu': 'キュ', 'kyo': 'キョ',
  'gya': 'ギャ', 'gyu': 'ギュ', 'gyo': 'ギョ',
  'sha': 'シャ', 'shu': 'シュ', 'sho': 'ショ',
  'ja': 'ジャ', 'ju': 'ジュ', 'jo': 'ジョ',
  'cha': 'チャ', 'chu': 'チュ', 'cho': 'チョ',
  'nya': 'ニャ', 'nyu': 'ニュ', 'nyo': 'ニョ',
  'hya': 'ヒャ', 'hyu': 'ヒュ', 'hyo': 'ヒョ',
  'bya': 'ビャ', 'byu': 'ビュ', 'byo': 'ビョ',
  'pya': 'ピャ', 'pyu': 'ピュ', 'pyo': 'ピョ',
  'mya': 'ミャ', 'myu': 'ミュ', 'myo': 'ミョ',
  'rya': 'リャ', 'ryu': 'リュ', 'ryo': 'リョ',
  // Long vowel mark
  '-': 'ー',
  // Small tsu (double consonants)
  'xtsu': 'ッ', 'xtu': 'ッ', 'ltsu': 'ッ', 'ltu': 'ッ'
};

export function convertToKatakana(text: string, allowPartial = false): string {
  if (!text) return '';

  text = text.toLowerCase().trim();
  let result = '';
  let i = 0;

  while (i < text.length) {
    let found = false;

    // Handle small tsu (ッ) - double consonants
    if (i < text.length - 1) {
      const currentChar = text[i];
      const nextChar = text[i + 1];
      
      if (currentChar === nextChar && 
          currentChar !== 'n' && 
          !'aeiou'.includes(currentChar) && 
          'kgsztdhbpmyrw'.includes(currentChar)) {
        result += 'ッ';
        i++;
        found = true;
      }
    }

    // Special handling for 'n'
    if (!found && text[i] === 'n') {
      if (i < text.length - 1) {
        // Try longer combinations first
        for (let length = 3; length >= 2; length--) {
          if (i + length <= text.length) {
            const substring = text.substring(i, i + length);
            if (romajiToKatakana[substring]) {
              result += romajiToKatakana[substring];
              i += length;
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          if (allowPartial) {
            result += text[i];
          } else {
            result += 'ン';
          }
          i++;
          found = true;
        }
      } else {
        result += 'ン';
        i++;
        found = true;
      }
    }

    // Regular conversion
    if (!found) {
      // Try longer combinations first
      for (let length = 4; length >= 1; length--) {
        if (i + length <= text.length) {
          const substring = text.substring(i, i + length);
          if (romajiToKatakana[substring]) {
            result += romajiToKatakana[substring];
            i += length;
            found = true;
            break;
          }
        }
      }
    }

    if (!found) {
      if (allowPartial) {
        result += text[i];
      }
      i++;
    }
  }

  return result;
}
