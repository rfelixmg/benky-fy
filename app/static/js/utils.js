// Romaji to Hiragana conversion mapping
const romajiToHiragana = {
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
    'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を', 'n': 'ん',
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
    // Small tsu (double consonants) - these will be handled specially
    'xtsu': 'っ', 'xtu': 'っ', 'ltsu': 'っ', 'ltu': 'っ'
};

function convertRomajiToHiragana(romajiText) {
    if (!romajiText) return "";

    romajiText = romajiText.toLowerCase().trim();
    let result = "";
    let i = 0;

    while (i < romajiText.length) {
        let found = false;

        // Handle small tsu (っ) - double consonants
        if (i < romajiText.length - 1) {
            const currentChar = romajiText[i];
            const nextChar = romajiText[i + 1];
            
            // Check for double consonants (except 'n' and vowels)
            if (currentChar === nextChar && 
                currentChar !== 'n' && 
                !'aeiou'.includes(currentChar) && 
                'kgsztdhbpmyrw'.includes(currentChar)) {
                
                result += 'っ';
                i++; // Skip the first consonant, the second will be processed normally
                found = true;
            }
        }

        // Special handling for 'n' - don't convert if followed by vowels or 'y'
        if (!found && romajiText[i] === 'n' && i < romajiText.length - 1) {
            const nextChar = romajiText[i + 1];
            
            // Don't convert 'n' if it's followed by a vowel or 'y' or another 'n'
            if (nextChar === 'a' || nextChar === 'i' || nextChar === 'u' || 
                nextChar === 'e' || nextChar === 'o' || nextChar === 'y' || 
                nextChar === 'n') {
                
                // Try longer combinations first
                for (let length = 3; length >= 2; length--) {
                    if (i + length <= romajiText.length) {
                        const substring = romajiText.substring(i, i + length);
                        if (romajiToHiragana[substring]) {
                            result += romajiToHiragana[substring];
                            i += length;
                            found = true;
                            break;
                        }
                    }
                }
                
                // If no combination found, leave 'n' as is for now
                if (!found) {
                    result += romajiText[i];
                    i++;
                    found = true;
                }
            }
        }

        // Regular conversion if not handled above
        if (!found) {
            // Try longer combinations first (4 chars, then 3, then 2, then 1)
            for (let length = 4; length >= 1; length--) {
                if (i + length <= romajiText.length) {
                    const substring = romajiText.substring(i, i + length);
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
            // If no mapping found, keep the original character
            result += romajiText[i];
            i++;
        }
    }

    return result;
}

// Make functions available globally
window.convertRomajiToHiragana = convertRomajiToHiragana;
window.romajiToHiragana = romajiToHiragana;
