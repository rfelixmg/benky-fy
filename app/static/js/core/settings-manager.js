/**
 * Settings Manager - Handles all settings state and persistence
 * Manages display modes, input modes, furigana styles, and weights
 */
export class SettingsManager {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.defaultSettings = this._getDefaultSettings(moduleName);
        this.settings = this.loadSettings();
    }

    /**
     * Get default settings based on module type
     */
    _getDefaultSettings(moduleName) {
        const baseSettings = {
            displayMode: 'kana',
            kanaTypes: ['hiragana'],
            inputModes: ['hiragana'],
            furiganaStyle: 'ruby',
            weights: {
                kana: 0.3,
                kanji: 0.3,
                kanji_furigana: 0.2,
                english: 0.2
            },
            practiceMode: 'flashcard'
        };

        // Only Verbs and Adjectives support conjugation
        if (moduleName === 'verbs' || moduleName === 'adjectives') {
            // Conjugation-capable modules
            return {
                ...baseSettings,
                conjugationForms: ['polite', 'negative', 'polite_negative'],
                conjugationPromptStyle: 'english'
            };
        } else if (moduleName === 'hiragana' || moduleName === 'katakana') {
            // Kana-only modules
            return {
                ...baseSettings,
                displayMode: 'kana',
                inputModes: ['hiragana', 'romaji'],
                kanaTypes: moduleName === 'hiragana' ? ['hiragana'] : ['katakana']
            };
        } else if (moduleName === 'katakana_words') {
            // Katakana words module - vocabulary with katakana focus
            return {
                ...baseSettings,
                displayMode: 'kana',
                inputModes: ['katakana', 'romaji', 'english'],
                kanaTypes: ['katakana']
            };
        } else if (moduleName.includes('numbers') || moduleName.includes('colors') || moduleName.includes('greetings')) {
            // Vocabulary modules with specific needs
            return {
                ...baseSettings,
                inputModes: ['hiragana', 'english'],
                displayMode: 'weighted'
            };
        }

        return baseSettings;
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(`settings-${this.moduleName}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Merge settings but preserve critical defaults for specific modules
                const merged = { ...this.defaultSettings, ...parsed };
                
                // Ensure katakana_words always has correct kanaTypes
                if (this.moduleName === 'katakana_words') {
                    merged.kanaTypes = ['katakana'];
                }
                
                return merged;
            }
        } catch (error) {
            console.warn('Failed to load settings from localStorage:', error);
        }
        return { ...this.defaultSettings };
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(`settings-${this.moduleName}`, JSON.stringify(this.settings));
            return true;
        } catch (error) {
            console.error('Failed to save settings to localStorage:', error);
            return false;
        }
    }

    /**
     * Save settings to backend
     */
    async saveToBackend() {
        try {
            const formData = new FormData();
            Object.keys(this.settings).forEach(key => {
                if (key === 'weights') {
                    Object.keys(this.settings[key]).forEach(weightKey => {
                        formData.append(`proportions.${weightKey}`, this.settings[key][weightKey]);
                    });
                } else if (Array.isArray(this.settings[key])) {
                    this.settings[key].forEach(value => {
                        formData.append(key, value);
                    });
                } else {
                    formData.append(key, this.settings[key]);
                }
            });

            const baseUrl = this._getBaseUrl(this.moduleName);
            const response = await fetch(`${baseUrl}/settings`, {
                method: 'POST',
                body: formData,
                redirect: 'manual'
            });

            if (response.status === 401 || response.status === 403 || response.status === 302) {
                throw new Error('Authentication required');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to save settings to backend:', error);
            throw error;
        }
    }

    /**
     * Update a specific setting
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    /**
     * Get a specific setting
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * Get all settings
     */
    getAllSettings() {
        return { ...this.settings };
    }

    /**
     * Reset to default settings
     */
    resetToDefaults() {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
    }

    /**
     * Check if conjugation is supported for this module
     */
    isConjugationSupported() {
        return this.moduleName === 'verbs' || this.moduleName === 'adjectives';
    }

    /**
     * Get available practice modes for this module
     */
    getAvailablePracticeModes() {
        if (this.isConjugationSupported()) {
            return ['flashcard', 'conjugation'];
        }
        return ['flashcard'];
    }

    /**
     * Get the correct base URL for the module
     */
    _getBaseUrl(moduleName) {
        // Handle special cases for modules with different URL patterns
        const urlMappings = {
            'numbers_basic': '/begginer/numbers-basic',
            'numbers_extended': '/begginer/numbers-extended', 
            'days_of_week': '/begginer/days-of-week',
            'months_complete': '/begginer/months',
            'colors_basic': '/begginer/colors',
            'greetings_essential': '/begginer/greetings',
            'question_words': '/begginer/question-words',
            'base_nouns': '/begginer/base_nouns',
            'katakana_words': '/begginer/katakana-words'
        };
        
        return urlMappings[moduleName] || `/begginer/${moduleName}`;
    }
}
