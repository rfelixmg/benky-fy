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

        // Practice mode change handlers
        const practiceModeInputs = document.querySelectorAll('input[name="practice_mode"]');
        practiceModeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this._handlePracticeModeChange(e.target.value);
            });
        });

        // Conjugation forms change handlers
        const conjugationFormInputs = document.querySelectorAll('input[name="conjugation_forms"]');
        conjugationFormInputs.forEach(input => {
            input.addEventListener('change', () => {
                this._handleConjugationFormsChange();
            });
        });

        // Conjugation prompt style change handlers
        const conjugationPromptStyleInputs = document.querySelectorAll('input[name="conjugation_prompt_style"]');
        conjugationPromptStyleInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this._handleConjugationPromptStyleChange(e.target.value);
            });
        });

        // Section toggle handlers
        this._setupSectionToggles();

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

        // Set practice mode
        const practiceModeInput = document.querySelector(`input[name="practice_mode"][value="${settings.practiceMode}"]`);
        if (practiceModeInput) {
            practiceModeInput.checked = true;
            this._updateSectionVisibilityForPracticeMode(settings.practiceMode);
            this._updateAnswerInputModesForPracticeMode(settings.practiceMode);
        }

        // Set conjugation forms
        const conjugationFormInputs = document.querySelectorAll('input[name="conjugation_forms"]');
        conjugationFormInputs.forEach(input => {
            input.checked = settings.conjugationForms.includes(input.value);
        });

        // Set conjugation prompt style
        const conjugationPromptStyleInput = document.querySelector(`input[name="conjugation_prompt_style"][value="${settings.conjugationPromptStyle}"]`);
        if (conjugationPromptStyleInput) {
            conjugationPromptStyleInput.checked = true;
        }
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

    /**
     * Handle practice mode change
     */
    _handlePracticeModeChange(mode) {
        if (!this.settingsManager) return;

        this.settingsManager.updateSetting('practiceMode', mode);
        
        // Show/hide sections based on practice mode
        this._updateSectionVisibilityForPracticeMode(mode);

        // Update answer input modes based on practice mode
        this._updateAnswerInputModesForPracticeMode(mode);

        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
    }

    /**
     * Update section visibility based on practice mode
     */
    _updateSectionVisibilityForPracticeMode(mode) {
        const flashcardDisplaySection = document.getElementById('flashcard-display-section');
        const conjugationSettingsSection = document.getElementById('conjugation-settings-section');
        const answerInputSection = document.getElementById('answer-input-section');
        
        if (mode === 'flashcard') {
            // Show flashcard display mode and answer input mode
            if (flashcardDisplaySection) {
                flashcardDisplaySection.style.display = 'block';
            }
            if (conjugationSettingsSection) {
                conjugationSettingsSection.style.display = 'none';
            }
            if (answerInputSection) {
                answerInputSection.style.display = 'block';
            }
        } else if (mode === 'conjugation') {
            // Show conjugation settings and answer input mode
            if (flashcardDisplaySection) {
                flashcardDisplaySection.style.display = 'none';
            }
            if (conjugationSettingsSection) {
                conjugationSettingsSection.style.display = 'block';
            }
            if (answerInputSection) {
                answerInputSection.style.display = 'block';
            }
        }
    }

    /**
     * Update answer input modes based on practice mode
     */
    _updateAnswerInputModesForPracticeMode(mode) {
        const inputModeInputs = document.querySelectorAll('input[name="input_modes"]');
        
        if (mode === 'conjugation') {
            // For conjugation practice, only enable hiragana and kanji
            inputModeInputs.forEach(input => {
                if (input.value === 'hiragana' || input.value === 'kanji') {
                    input.disabled = false;
                    input.parentElement.style.opacity = '1';
                } else {
                    input.disabled = true;
                    input.checked = false;
                    input.parentElement.style.opacity = '0.5';
                }
            });
            
            // Ensure at least hiragana is selected
            const hiraganaInput = document.querySelector('input[name="input_modes"][value="hiragana"]');
            if (hiraganaInput && !hiraganaInput.checked) {
                hiraganaInput.checked = true;
            }
            
            // Update settings
            this._handleInputModeChange();
        } else {
            // For regular flashcards, enable all input modes
            inputModeInputs.forEach(input => {
                input.disabled = false;
                input.parentElement.style.opacity = '1';
            });
        }
    }

    /**
     * Handle conjugation forms change
     */
    _handleConjugationFormsChange() {
        if (!this.settingsManager) return;

        const checkboxes = document.querySelectorAll('input[name="conjugation_forms"]:checked');
        const conjugationForms = Array.from(checkboxes).map(cb => cb.value);
        
        this.settingsManager.updateSetting('conjugationForms', conjugationForms);

        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
    }

    /**
     * Handle conjugation prompt style change
     */
    _handleConjugationPromptStyleChange(style) {
        if (!this.settingsManager) return;

        this.settingsManager.updateSetting('conjugationPromptStyle', style);

        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
    }

    /**
     * Setup section toggle functionality
     */
    _setupSectionToggles() {
        const sectionHeaders = document.querySelectorAll('.settings-section-header');
        
        sectionHeaders.forEach(header => {
            const toggle = header.querySelector('.section-toggle');
            const section = header.parentElement;
            const content = section.querySelector('.settings-section-content');
            
            if (toggle && content) {
                // Set initial state
                const isCollapsed = content.style.display === 'none';
                this._updateToggleIcon(toggle, !isCollapsed);
                
                // Add click handler
                header.addEventListener('click', () => {
                    const isCurrentlyCollapsed = content.style.display === 'none';
                    
                    if (isCurrentlyCollapsed) {
                        content.style.display = 'block';
                        this._updateToggleIcon(toggle, true);
                    } else {
                        content.style.display = 'none';
                        this._updateToggleIcon(toggle, false);
                    }
                });
            }
        });
    }

    /**
     * Update toggle icon based on expanded state
     */
    _updateToggleIcon(toggle, isExpanded) {
        if (isExpanded) {
            toggle.textContent = '▼';
            toggle.style.transform = 'rotate(0deg)';
        } else {
            toggle.textContent = '▶';
            toggle.style.transform = 'rotate(0deg)';
        }
    }
}
