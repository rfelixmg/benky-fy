/**
 * Settings Manager - Handles all settings state and persistence
 * Manages display modes, input modes, furigana styles, and weights
 * Now with module-aware configuration support
 */
export class SettingsManager {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.moduleConfig = null;
        this.defaultSettings = this._getDefaultSettings(moduleName);
        this.settings = this.loadSettings();
        this.configLoadPromise = this.loadModuleConfig();
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

    /**
     * Load module configuration from backend
     */
    async loadModuleConfig() {
        try {
            const response = await fetch(`/api/settings/${this.moduleName}`);
            if (response.ok) {
                this.moduleConfig = await response.json();
                this.validateCurrentSettings();
                console.log('Module config loaded for', this.moduleName, ':', this.moduleConfig);
            } else {
                console.warn('Failed to load module config:', response.status);
            }
        } catch (error) {
            console.error('Failed to load module config:', error);
        }
    }
    
    /**
     * Wait for module config to be loaded
     */
    async waitForConfig() {
        if (this.configLoadPromise) {
            await this.configLoadPromise;
        }
    }

    /**
     * Validate current settings against module configuration
     */
    validateCurrentSettings() {
        if (!this.moduleConfig) return;

        const invalidSettings = [];
        const restrictedSettings = [];

        Object.keys(this.settings).forEach(key => {
            const value = this.settings[key];
            
            // Check if setting is restricted for this module
            if (this.isSettingRestricted(key, value)) {
                restrictedSettings.push({ key, value });
            }
            
            // Check if setting value is available for this module
            if (!this.isSettingAvailable(key, value)) {
                invalidSettings.push({ key, value });
            }
        });

        // Reset invalid/restricted settings to defaults
        [...invalidSettings, ...restrictedSettings].forEach(({ key }) => {
            const defaultValue = this.moduleConfig.defaults[key];
            if (defaultValue !== undefined) {
                this.settings[key] = defaultValue;
                console.log(`Reset invalid setting '${key}' to default for module '${this.moduleName}'`);
            }
        });

        if (invalidSettings.length > 0 || restrictedSettings.length > 0) {
            this.saveSettings();
        }
    }

    /**
     * Check if a setting is restricted for this module
     */
    isSettingRestricted(settingKey, value) {
        if (!this.moduleConfig) return false;
        
        const restrictedOptions = this.moduleConfig.restricted_options;
        for (const [key, values] of Object.entries(restrictedOptions)) {
            if (settingKey === key || values.includes(settingKey) || values.includes(value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a setting value is available for this module
     */
    isSettingAvailable(settingKey, value) {
        if (!this.moduleConfig) return true;
        
        const availableOptions = this.moduleConfig.available_options[settingKey];
        if (!availableOptions || availableOptions.length === 0) {
            return true; // No restrictions, all values allowed
        }
        
        return availableOptions.includes(value);
    }

    /**
     * Get available options for a setting
     */
    getAvailableOptions(settingKey) {
        if (!this.moduleConfig) return null;
        return this.moduleConfig.available_options[settingKey] || null;
    }

    /**
     * Validate settings against module configuration
     */
    async validateSettings(settings) {
        try {
            const response = await fetch('/api/settings/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    module_name: this.moduleName,
                    settings: settings
                })
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Validation failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to validate settings:', error);
            throw error;
        }
    }

    /**
     * Update setting with validation
     */
    async updateSettingWithValidation(key, value) {
        // Check if setting is restricted
        if (this.isSettingRestricted(key, value)) {
            throw new Error(`Setting '${key}' is not allowed for module '${this.moduleName}'`);
        }

        // Check if setting value is available
        if (!this.isSettingAvailable(key, value)) {
            throw new Error(`Setting value '${value}' is not available for module '${this.moduleName}'`);
        }

        // If validation passes, update the setting
        this.updateSetting(key, value);
    }

    /**
     * Get module-specific default settings
     */
    getModuleDefaults() {
        return this.moduleConfig ? this.moduleConfig.defaults : {};
    }

    /**
     * Get restricted options for this module
     */
    getRestrictedOptions() {
        return this.moduleConfig ? this.moduleConfig.restricted_options : {};
    }
}
