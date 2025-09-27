/**
 * Settings Manager - Handles all settings state and persistence
 * Manages display modes, input modes, furigana styles, and weights
 */
export class SettingsManager {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.defaultSettings = {
            displayMode: 'kana',
            kanaTypes: ['hiragana'],
            inputModes: ['hiragana'],
            furiganaStyle: 'ruby',
            weights: {
                kana: 0.3,
                kanji: 0.3,
                kanji_furigana: 0.2,
                english: 0.2
            }
        };
        this.settings = this.loadSettings();
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(`settings-${this.moduleName}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...this.defaultSettings, ...parsed };
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

            const response = await fetch(`/begginer/${this.moduleName}/settings`, {
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
}
