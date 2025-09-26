/**
 * Validation Utilities - Input validation and sanitization
 * Handles validation of user inputs and data
 */
export class ValidationUtils {
    /**
     * Validate romaji input
     * @param {string} input - The input to validate
     * @returns {boolean} - Whether the input is valid romaji
     */
    static isValidRomaji(input) {
        if (!input || typeof input !== 'string') return false;
        
        // Basic romaji pattern (letters, hyphens, spaces)
        const romajiPattern = /^[a-zA-Z\s\-']+$/;
        return romajiPattern.test(input.trim());
    }

    /**
     * Validate hiragana input
     * @param {string} input - The input to validate
     * @returns {boolean} - Whether the input is valid hiragana
     */
    static isValidHiragana(input) {
        if (!input || typeof input !== 'string') return false;
        
        // Hiragana Unicode range: ひらがな (U+3040-U+309F)
        const hiraganaPattern = /^[\u3040-\u309F\s]+$/;
        return hiraganaPattern.test(input.trim());
    }

    /**
     * Validate katakana input
     * @param {string} input - The input to validate
     * @returns {boolean} - Whether the input is valid katakana
     */
    static isValidKatakana(input) {
        if (!input || typeof input !== 'string') return false;
        
        // Katakana Unicode range: カタカナ (U+30A0-U+30FF)
        const katakanaPattern = /^[\u30A0-\u30FF\s]+$/;
        return katakanaPattern.test(input.trim());
    }

    /**
     * Validate kanji input
     * @param {string} input - The input to validate
     * @returns {boolean} - Whether the input contains kanji
     */
    static containsKanji(input) {
        if (!input || typeof input !== 'string') return false;
        
        // Kanji Unicode ranges: CJK Unified Ideographs
        const kanjiPattern = /[\u4E00-\u9FAF]/;
        return kanjiPattern.test(input);
    }

    /**
     * Sanitize input text
     * @param {string} input - The input to sanitize
     * @returns {string} - The sanitized input
     */
    static sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input.trim()
                   .replace(/[<>]/g, '') // Remove potential HTML tags
                   .substring(0, 100); // Limit length
    }

    /**
     * Check if input is empty or whitespace only
     * @param {string} input - The input to check
     * @returns {boolean} - Whether the input is empty
     */
    static isEmpty(input) {
        return !input || typeof input !== 'string' || input.trim().length === 0;
    }

    /**
     * Validate settings object
     * @param {Object} settings - The settings to validate
     * @returns {boolean} - Whether the settings are valid
     */
    static validateSettings(settings) {
        if (!settings || typeof settings !== 'object') return false;

        const requiredKeys = ['displayMode', 'inputModes', 'furiganaStyle'];
        const validDisplayModes = ['kana', 'kanji', 'kanji_furigana', 'weighted', 'english'];
        const validFuriganaStyles = ['ruby', 'brackets', 'hover', 'inline'];
        const validInputModes = ['hiragana', 'katakana', 'romaji', 'kanji', 'english'];

        // Check required keys
        for (const key of requiredKeys) {
            if (!(key in settings)) return false;
        }

        // Validate display mode
        if (!validDisplayModes.includes(settings.displayMode)) return false;

        // Validate furigana style
        if (!validFuriganaStyles.includes(settings.furiganaStyle)) return false;

        // Validate input modes
        if (!Array.isArray(settings.inputModes) || settings.inputModes.length === 0) return false;
        for (const mode of settings.inputModes) {
            if (!validInputModes.includes(mode)) return false;
        }

        // Validate weights if present
        if (settings.weights && typeof settings.weights === 'object') {
            const weightKeys = Object.keys(settings.weights);
            for (const key of weightKeys) {
                const weight = settings.weights[key];
                if (typeof weight !== 'number' || weight < 0 || weight > 1) return false;
            }
        }

        return true;
    }
}
