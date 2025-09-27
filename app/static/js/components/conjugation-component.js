/**
 * Conjugation Component - Handles conjugation practice logic
 * Manages conjugation-specific functionality separate from regular flashcards
 */
export class ConjugationComponent {
    constructor(apiClient, settingsManager) {
        this.apiClient = apiClient;
        this.settingsManager = settingsManager;
        this.currentConjugationItem = null;
        this.currentConjugationForm = null;
        this.availableForms = [];
    }

    /**
     * Initialize conjugation component
     */
    async initialize() {
        try {
            // Load available conjugation forms for the module
            await this._loadAvailableForms();
        } catch (error) {
            console.error('Failed to initialize conjugation component:', error);
        }
    }

    /**
     * Load available conjugation forms
     */
    async _loadAvailableForms() {
        try {
            const moduleName = this.apiClient.moduleName;
            
            // Check if module supports conjugation
            if (!this._isConjugationSupported(moduleName)) {
                this.availableForms = [];
                return;
            }
            
            const response = await this.apiClient.getConjugationForms(moduleName);
            this.availableForms = response.forms || [];
        } catch (error) {
            console.error('Failed to load conjugation forms:', error);
            // Provide fallback forms based on module type
            this.availableForms = this._getFallbackForms(this.apiClient.moduleName);
        }
    }

    /**
     * Check if module supports conjugation
     */
    _isConjugationSupported(moduleName) {
        const conjugationModules = ['verbs', 'adjectives'];
        return conjugationModules.includes(moduleName);
    }

    /**
     * Get fallback conjugation forms based on module type
     */
    _getFallbackForms(moduleName) {
        if (moduleName === 'verbs') {
            return ['polite', 'negative', 'polite_negative', 'past', 'polite_past', 'past_negative'];
        } else if (moduleName === 'adjectives') {
            return ['polite', 'negative', 'polite_negative'];
        }
        return [];
    }

    /**
     * Get a random conjugation practice item with multiple forms
     */
    async getRandomConjugationItem() {
        try {
            const settings = this.settingsManager.getAllSettings();
            console.log('Conjugation settings:', settings);
            
            const conjugationForms = settings.conjugationForms || ['polite'];
            console.log('Selected conjugation forms:', conjugationForms);
            
            // Select a random conjugation form from available forms
            const availableSelectedForms = conjugationForms.filter(form => 
                this.availableForms.includes(form)
            );
            
            console.log('Available selected forms:', availableSelectedForms);
            
            if (availableSelectedForms.length === 0) {
                throw new Error('No conjugation forms available');
            }
            
            // Get a random item first
            const moduleName = this.apiClient.moduleName;
            const response = await this.apiClient.getConjugationPractice(moduleName, 'polite'); // Use any form to get the item
            console.log('API response:', response);
            
            if (response.success) {
                this.currentConjugationItem = response.item;
                
                return {
                    item: response.item,
                    conjugationForms: availableSelectedForms
                };
            } else {
                throw new Error(response.error || 'Failed to get conjugation practice item');
            }
        } catch (error) {
            console.error('Failed to get conjugation practice item:', error);
            throw error;
        }
    }

    /**
     * Get display name for conjugation form
     */
    _getFormDisplayName(form) {
        const formNames = {
            'polite': 'Polite (ます)',
            'negative': 'Negative (ない)',
            'polite_negative': 'Polite Negative (ません)',
            'past': 'Past (た)',
            'polite_past': 'Polite Past (ました)',
            'past_negative': 'Past Negative (なかった)'
        };
        return formNames[form] || form;
    }

    /**
     * Generate conjugation prompt based on settings
     */
    _generatePrompt(item, conjugationForm, promptStyle) {
        if (promptStyle === 'kanji') {
            return item.kanji;
        } else if (promptStyle === 'furigana') {
            return item.hiragana;
        } else {
            // Default to English
            return item.english;
        }
    }

    /**
     * Check multiple conjugation answers
     */
    async checkConjugationAnswers(userAnswers) {
        try {
            if (!this.currentConjugationItem) {
                throw new Error('No conjugation item loaded');
            }

            const results = [];
            const moduleName = this.apiClient.moduleName;
            
            // Check each conjugation form
            for (const [form, formAnswers] of Object.entries(userAnswers)) {
                if (formAnswers && Object.keys(formAnswers).length > 0) {
                    // Check each input mode for this form
                    for (const [mode, userInput] of Object.entries(formAnswers)) {
                        if (userInput && userInput.trim().length > 0) {
                            try {
                                const response = await this.apiClient.checkConjugation(
                                    userInput,
                                    this.currentConjugationItem.id,
                                    form,
                                    moduleName
                                );
                                results.push({
                                    form: form,
                                    mode: mode,
                                    userInput: userInput,
                                    result: response,
                                    formName: this._getFormDisplayName(form)
                                });
                            } catch (error) {
                                console.error(`Failed to check conjugation for form ${form}, mode ${mode}:`, error);
                                results.push({
                                    form: form,
                                    mode: mode,
                                    userInput: userInput,
                                    result: {
                                        is_correct: false,
                                        correct_answer: 'Error',
                                        feedback: 'Failed to check answer',
                                        conjugation_form: form
                                    },
                                    formName: this._getFormDisplayName(form)
                                });
                            }
                        }
                    }
                }
            }
            
            return results;
        } catch (error) {
            console.error('Failed to check conjugation answers:', error);
            throw error;
        }
    }

    /**
     * Get conjugation statistics
     */
    async getConjugationStatistics() {
        try {
            const moduleName = this.apiClient.moduleName;
            const response = await this.apiClient.getConjugationStats(moduleName);
            return response;
        } catch (error) {
            console.error('Failed to get conjugation statistics:', error);
            return null;
        }
    }

    /**
     * Get current conjugation item
     */
    getCurrentItem() {
        return this.currentConjugationItem;
    }

    /**
     * Get current conjugation form
     */
    getCurrentForm() {
        return this.currentConjugationForm;
    }

    /**
     * Get available conjugation forms
     */
    getAvailableForms() {
        return this.availableForms;
    }

    /**
     * Check if conjugation mode is supported for current module
     */
    isConjugationSupported() {
        return this.availableForms.length > 0;
    }
}
