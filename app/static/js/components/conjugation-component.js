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
            console.log('Conjugation component initialized successfully');
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
            const response = await this.apiClient.getConjugationForms(moduleName);
            this.availableForms = response.forms || [];
        } catch (error) {
            console.error('Failed to load conjugation forms:', error);
            this.availableForms = ['polite', 'negative', 'polite_negative', 'past', 'polite_past', 'past_negative'];
        }
    }

    /**
     * Get a random conjugation practice item
     */
    async getRandomConjugationItem() {
        try {
            const settings = this.settingsManager.getAllSettings();
            const conjugationForms = settings.conjugationForms || ['polite'];
            
            // Select a random conjugation form from available forms
            const availableSelectedForms = conjugationForms.filter(form => 
                this.availableForms.includes(form)
            );
            
            if (availableSelectedForms.length === 0) {
                throw new Error('No conjugation forms available');
            }
            
            const randomForm = availableSelectedForms[Math.floor(Math.random() * availableSelectedForms.length)];
            this.currentConjugationForm = randomForm;
            
            const moduleName = this.apiClient.moduleName;
            const response = await this.apiClient.getConjugationPractice(moduleName, randomForm);
            
            if (response.success) {
                this.currentConjugationItem = response.item;
                return {
                    item: response.item,
                    conjugationForm: randomForm,
                    prompt: this._generatePrompt(response.item, randomForm, settings.conjugationPromptStyle)
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
     * Generate conjugation prompt based on settings
     */
    _generatePrompt(item, conjugationForm, promptStyle) {
        const formNames = {
            'polite': 'polite form (ます)',
            'negative': 'negative form (ない)',
            'polite_negative': 'polite negative form (ません)',
            'past': 'past form (た)',
            'polite_past': 'polite past form (ました)',
            'past_negative': 'past negative form (なかった)'
        };

        const formName = formNames[conjugationForm] || conjugationForm;

        if (promptStyle === 'hiragana') {
            return `Conjugate '${item.hiragana}' in ${formName}`;
        } else {
            return `Conjugate '${item.english}' in ${formName}`;
        }
    }

    /**
     * Check conjugation answer
     */
    async checkConjugationAnswer(userInput) {
        try {
            if (!this.currentConjugationItem || !this.currentConjugationForm) {
                throw new Error('No conjugation item loaded');
            }

            const moduleName = this.apiClient.moduleName;
            const response = await this.apiClient.checkConjugation(
                userInput,
                this.currentConjugationItem.id,
                this.currentConjugationForm,
                moduleName
            );

            return response;
        } catch (error) {
            console.error('Failed to check conjugation answer:', error);
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
