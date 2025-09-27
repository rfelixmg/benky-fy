/**
 * Katakana Converter - Romaji to katakana conversion
 * Converts romaji text to katakana characters
 */

export const romajiToKatakana = {
    // Basic vowels
    'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ',
    
    // K series
    'ka': 'カ', 'ki': 'キ', 'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',
    'ga': 'ガ', 'gi': 'ギ', 'gu': 'グ', 'ge': 'ゲ', 'go': 'ゴ',
    
    // S series
    'sa': 'サ', 'shi': 'シ', 'su': 'ス', 'se': 'セ', 'so': 'ソ',
    'za': 'ザ', 'ji': 'ジ', 'zu': 'ズ', 'ze': 'ゼ', 'zo': 'ゾ',
    
    // T series
    'ta': 'タ', 'chi': 'チ', 'tsu': 'ツ', 'te': 'テ', 'to': 'ト',
    'da': 'ダ', 'di': 'ヂ', 'du': 'ヅ', 'de': 'デ', 'do': 'ド',
    
    // N series
    'na': 'ナ', 'ni': 'ニ', 'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ',
    
    // H series
    'ha': 'ハ', 'hi': 'ヒ', 'fu': 'フ', 'he': 'ヘ', 'ho': 'ホ',
    'ba': 'バ', 'bi': 'ビ', 'bu': 'ブ', 'be': 'ベ', 'bo': 'ボ',
    'pa': 'パ', 'pi': 'ピ', 'pu': 'プ', 'pe': 'ペ', 'po': 'ポ',
    
    // M series
    'ma': 'マ', 'mi': 'ミ', 'mu': 'ム', 'me': 'メ', 'mo': 'モ',
    
    // Y series
    'ya': 'ヤ', 'yu': 'ユ', 'yo': 'ヨ',
    
    // R series
    'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
    
    // W series
    'wa': 'ワ', 'wi': 'ヰ', 'we': 'ヱ', 'wo': 'ヲ', 'n': 'ン',
    
    // Common combinations (3 characters)
    'kya': 'キャ', 'kyu': 'キュ', 'kyo': 'キョ',
    'gya': 'ギャ', 'gyu': 'ギュ', 'gyo': 'ギョ',
    'sha': 'シャ', 'shu': 'シュ', 'sho': 'ショ',
    'shya': 'シャ', 'shyu': 'シュ', 'shyo': 'ショ',
    'ja': 'ジャ', 'ju': 'ジュ', 'jo': 'ジョ',
    'jya': 'ジャ', 'jyu': 'ジュ', 'jyo': 'ジョ',
    'cha': 'チャ', 'chu': 'チュ', 'cho': 'チョ',
    'chya': 'チャ', 'chyu': 'チュ', 'chyo': 'チョ',
    'nya': 'ニャ', 'nyu': 'ニュ', 'nyo': 'ニョ',
    'nyya': 'ニャ', 'nyyu': 'ニュ', 'nyyo': 'ニョ',
    'hya': 'ヒャ', 'hyu': 'ヒュ', 'hyo': 'ヒョ',
    'hyya': 'ヒャ', 'hyyu': 'ヒュ', 'hyyo': 'ヒョ',
    'bya': 'ビャ', 'byu': 'ビュ', 'byo': 'ビョ',
    'byya': 'ビャ', 'byyu': 'ビュ', 'byyo': 'ビョ',
    'pya': 'ピャ', 'pyu': 'ピュ', 'pyo': 'ピョ',
    'pyya': 'ピャ', 'pyyu': 'ピュ', 'pyyo': 'ピョ',
    'mya': 'ミャ', 'myu': 'ミュ', 'myo': 'ミョ',
    'myya': 'ミャ', 'myyu': 'ミュ', 'myyo': 'ミョ',
    'rya': 'リャ', 'ryu': 'リュ', 'ryo': 'リョ',
    'ryya': 'リャ', 'ryyu': 'リュ', 'ryyo': 'リョ',
    
    // Long vowel mark
    '-': 'ー',
    
    // Small tsu (double consonants) - these will be handled specially
    'xtsu': 'ッ', 'xtu': 'ッ', 'ltsu': 'ッ', 'ltu': 'ッ'
};

/**
 * Convert romaji text to katakana
 * @param {string} romajiText - The romaji text to convert
 * @returns {string} - The converted katakana text
 */
export function convertRomajiToKatakana(romajiText) {
    if (!romajiText) return "";

    romajiText = romajiText.toLowerCase().trim();
    let result = "";
    let i = 0;

    while (i < romajiText.length) {
        let found = false;

        // Handle small tsu (ッ) - double consonants
        if (i < romajiText.length - 1) {
            const currentChar = romajiText[i];
            const nextChar = romajiText[i + 1];
            
            // Check for double consonants (except 'n' and vowels)
            if (currentChar === nextChar && 
                currentChar !== 'n' && 
                !'aeiou'.includes(currentChar) && 
                'kgsztdhbpmyrw'.includes(currentChar)) {
                
                result += 'ッ';
                i++; // Skip the first consonant, the second will be processed normally
                found = true;
            }
        }

        // Special handling for 'n' - be more conservative with conversion
        if (!found && romajiText[i] === 'n') {
            if (i < romajiText.length - 1) {
                const nextChar = romajiText[i + 1];
                
                // Try longer combinations first (na, ni, nu, ne, no, nya, etc.)
                for (let length = 3; length >= 2; length--) {
                    if (i + length <= romajiText.length) {
                        const substring = romajiText.substring(i, i + length);
                        if (romajiToKatakana[substring]) {
                            result += romajiToKatakana[substring];
                            i += length;
                            found = true;
                            break;
                        }
                    }
                }
                
                // If no combination found, leave 'n' unconverted to wait for more input
                if (!found) {
                    result += romajiText[i];
                    i++;
                    found = true;
                }
            } else {
                // 'n' at end of string - convert to 'ン' only if it's clearly standalone
                result += 'ン';
                i++;
                found = true;
            }
        }

        // Regular conversion if not handled above
        if (!found) {
            // Try longer combinations first (4 chars, then 3, then 2, then 1)
            for (let length = 4; length >= 1; length--) {
                if (i + length <= romajiText.length) {
                    const substring = romajiText.substring(i, i + length);
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
            // If no mapping found, keep the original character
            result += romajiText[i];
            i++;
        }
    }

    return result;
}

/**
 * Check if a character is katakana
 * @param {string} char - The character to check
 * @returns {boolean} - True if the character is katakana
 */
export function isKatakana(char) {
    const katakanaRange = /[\u30A0-\u30FF]/;
    return katakanaRange.test(char);
}

/**
 * Check if text contains katakana characters
 * @param {string} text - The text to check
 * @returns {boolean} - True if the text contains katakana
 */
export function containsKatakana(text) {
    if (!text) return false;
    return Array.from(text).some(char => isKatakana(char));
}

// Make functions available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.convertRomajiToKatakana = convertRomajiToKatakana;
    window.romajiToKatakana = romajiToKatakana;
    window.isKatakana = isKatakana;
    window.containsKatakana = containsKatakana;
    
    // Backward compatibility aliases
    window.convertKatakanaToHiragana = convertRomajiToKatakana; // For existing code
    window.katakanaToHiragana = romajiToKatakana; // For existing code
}
