/**
 * Settings Modal Component - Handles settings modal UI and interactions
 * Manages the settings modal display and user interactions
 */
export class SettingsModal {
    constructor() {
        this.modal = null;
        this.isVisible = false;
        this.settingsManager = null;
        this.onSettingsChange = null;
    }

    /**
     * Initialize the settings modal
     */
    initialize(settingsManager, onSettingsChange) {
        this.settingsManager = settingsManager;
        this.onSettingsChange = onSettingsChange;
        this.modal = document.getElementById('settingsModal');
        
        if (!this.modal) {
            console.warn('Settings modal not found');
            return;
        }

        this._setupEventListeners();
        this._loadSettingsIntoUI();
    }

    /**
     * Toggle modal visibility
     */
    toggle() {
        if (!this.modal) return;

        this.isVisible = !this.isVisible;
        this.modal.classList.toggle('show', this.isVisible);

        if (this.isVisible) {
            this._loadSettingsIntoUI();
        }
    }

    /**
     * Show modal
     */
    show() {
        if (!this.modal) return;

        this.isVisible = true;
        this.modal.classList.add('show');
        this._loadSettingsIntoUI();
    }

    /**
     * Hide modal
     */
    hide() {
        if (!this.modal) return;

        this.isVisible = false;
        this.modal.classList.remove('show');
    }

    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (event) => {
            if (this.isVisible && !this.modal.contains(event.target) && 
                !event.target.closest('.settings-btn')) {
                this.hide();
            }
        });

        // Close button handler
        const closeButton = document.querySelector('.settings-close-btn');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hide();
            });
        }

        // Display mode change handlers
        const displayModeInputs = document.querySelectorAll('input[name="display_mode"]');
        displayModeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this._handleDisplayModeChange(e.target.value);
            });
        });

        // Input mode change handlers
        const inputModeInputs = document.querySelectorAll('input[name="input_modes"]');
        inputModeInputs.forEach(input => {
            input.addEventListener('change', () => {
                this._handleInputModeChange();
            });
        });

        // Furigana style change handlers
        const furiganaStyleSelect = document.querySelector('#furigana-style');
        if (furiganaStyleSelect) {
            furiganaStyleSelect.addEventListener('change', (e) => {
                this._handleFuriganaStyleChange(e.target.value);
            });
        }

        // Weight change handlers
        const weightInputs = document.querySelectorAll('input[name^="proportions."]');
        weightInputs.forEach(input => {
            input.addEventListener('change', () => {
                this._handleWeightChange();
            });
        });

        // Save button
        const saveButton = document.querySelector('#saveSettingsBtn');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this._saveSettings();
            });
        }

        // Reset button
        const resetButton = document.querySelector('#resetSettingsBtn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this._resetSettings();
            });
        }
    }

    /**
     * Load settings into UI
     */
    _loadSettingsIntoUI() {
        if (!this.settingsManager) return;

        const settings = this.settingsManager.getAllSettings();

        // Set display mode
        const displayModeInput = document.querySelector(`input[name="display_mode"][value="${settings.displayMode}"]`);
        if (displayModeInput) {
            displayModeInput.checked = true;
            this._handleDisplayModeChange(settings.displayMode);
        }

        // Set input modes
        const inputModeInputs = document.querySelectorAll('input[name="input_modes"]');
        inputModeInputs.forEach(input => {
            input.checked = settings.inputModes.includes(input.value);
        });

        // Set furigana style
        const furiganaStyleInput = document.querySelector(`input[name="furigana_style"][value="${settings.furiganaStyle}"]`);
        if (furiganaStyleInput) {
            furiganaStyleInput.checked = true;
        }

        // Set weights
        Object.keys(settings.weights).forEach(key => {
            const weightInput = document.querySelector(`input[name="proportions.${key}"]`);
            if (weightInput) {
                weightInput.value = settings.weights[key];
            }
        });
    }

    /**
     * Handle display mode change
     */
    _handleDisplayModeChange(mode) {
        if (!this.settingsManager) return;

        this.settingsManager.updateSetting('displayMode', mode);
        
        // Show/hide relevant panels
        const weightedPanel = document.getElementById('weighted-panel');
        const kanaTogglePanel = document.getElementById('kana-toggle-panel');
        const furiganaStylePanel = document.getElementById('furigana-style-panel');
        
        if (weightedPanel) weightedPanel.style.display = mode === 'weighted' ? 'block' : 'none';
        if (kanaTogglePanel) kanaTogglePanel.style.display = mode === 'kana' ? 'block' : 'none';
        if (furiganaStylePanel) furiganaStylePanel.style.display = mode === 'kanji_furigana' ? 'block' : 'none';

        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
    }

    /**
     * Handle input mode change
     */
    _handleInputModeChange() {
        if (!this.settingsManager) return;

        const checkboxes = document.querySelectorAll('input[name="input_modes"]:checked');
        const inputModes = Array.from(checkboxes).map(cb => cb.value);
        
        this.settingsManager.updateSetting('inputModes', inputModes);

        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
    }

    /**
     * Handle furigana style change
     */
    _handleFuriganaStyleChange(style) {
        if (!this.settingsManager) return;

        this.settingsManager.updateSetting('furiganaStyle', style);

        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
    }

    /**
     * Handle weight change
     */
    _handleWeightChange() {
        if (!this.settingsManager) return;

        const weights = {};
        const weightInputs = document.querySelectorAll('input[name^="proportions."]');
        weightInputs.forEach(input => {
            const key = input.name.replace('proportions.', '');
            weights[key] = parseFloat(input.value) || 0;
        });

        this.settingsManager.updateSetting('weights', weights);

        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
    }

    /**
     * Save settings
     */
    async _saveSettings() {
        if (!this.settingsManager) return;

        try {
            await this.settingsManager.saveToBackend();
            console.log('Settings saved successfully');
            this.hide();
        } catch (error) {
            console.error('Failed to save settings:', error);
            // Settings are still saved to localStorage
        }
    }

    /**
     * Reset settings to defaults
     */
    _resetSettings() {
        if (!this.settingsManager) return;

        this.settingsManager.resetToDefaults();
        this._loadSettingsIntoUI();
        
        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
        
        console.log('Settings reset to defaults');
    }
}
