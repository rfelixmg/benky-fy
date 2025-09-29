import { RomajiChar, JapaneseChar } from '../../types/japanese';

export const romajiToHiragana: Record<RomajiChar, JapaneseChar> = {
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を',
  'n': 'ん',
  // Common combinations
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
  // Long vowel mark
  '-': 'ー',
  // Small tsu (double consonants)
  'xtsu': 'っ', 'xtu': 'っ', 'ltsu': 'っ', 'ltu': 'っ'
};

export function convertToHiragana(text: string, allowPartial = false): string {
  if (!text) return '';

  text = text.toLowerCase().trim();
  let result = '';
  let i = 0;

  while (i < text.length) {
    let found = false;

    // Handle small tsu (っ) - double consonants
    if (i < text.length - 1) {
      const currentChar = text[i];
      const nextChar = text[i + 1];
      
      if (currentChar === nextChar && 
          currentChar !== 'n' && 
          !'aeiou'.includes(currentChar) && 
          'kgsztdhbpmyrw'.includes(currentChar)) {
        result += 'っ';
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
            if (romajiToHiragana[substring]) {
              result += romajiToHiragana[substring];
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
            result += 'ん';
          }
          i++;
          found = true;
        }
      } else {
        result += 'ん';
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
          if (romajiToHiragana[substring]) {
            result += romajiToHiragana[substring];
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
