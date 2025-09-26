/**
 * Flashcard Component - Main flashcard logic and state management
 * Orchestrates all flashcard functionality
 */
export class FlashcardComponent {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.settingsManager = null;
        this.apiClient = null;
        this.inputManager = null;
        this.displayManager = null;
        this.settingsModal = null;
        
        this.currentItemId = 1;
        this.isUserInteraction = false;
        this.isPageLoaded = false;
    }

    /**
     * Initialize the flashcard component
     */
    async initialize() {
        try {
            // Initialize core managers
            this.settingsManager = new SettingsManager(this.moduleName);
            this.apiClient = new ApiClient(this.moduleName);
            this.inputManager = new InputManager('.answer-section');
            this.displayManager = new DisplayManager('.flashcard-container');
            this.settingsModal = new SettingsModal();

            // Setup settings modal
            this.settingsModal.initialize(
                this.settingsManager,
                () => this._onSettingsChange()
            );

            // Setup toggle button
            this._setupToggleButton();

            // Load initial content
            await this._loadInitialContent();

            // Mark page as loaded
            this.isPageLoaded = true;

            console.log('Flashcard component initialized successfully');
        } catch (error) {
            console.error('Failed to initialize flashcard component:', error);
        }
    }

    /**
     * Setup settings toggle button
     */
    _setupToggleButton() {
        const toggleBtn = document.querySelector('.settings-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.settingsModal.toggle();
            });
        }
    }

    /**
     * Load initial content
     */
    async _loadInitialContent() {
        try {
            // Load settings into UI
            this._applySettingsToUI();

            // Load initial flashcard
            await this._loadFlashcard();

            // Setup check button
            this._setupCheckButton();
        } catch (error) {
            console.error('Failed to load initial content:', error);
        }
    }

    /**
     * Apply settings to UI
     */
    _applySettingsToUI() {
        const settings = this.settingsManager.getAllSettings();
        
        // Update input fields
        this.inputManager.createInputFields(settings.inputModes);
        
        // Update display
        this._updateDisplay();
    }

    /**
     * Load flashcard content
     */
    async _loadFlashcard() {
        try {
            const settings = this.settingsManager.getAllSettings();
            await this.displayManager.updateDisplay(
                this.currentItemId,
                settings,
                this.apiClient
            );
        } catch (error) {
            console.error('Failed to load flashcard:', error);
            this.displayManager.showError('Failed to load flashcard');
        }
    }

    /**
     * Update display based on current settings
     */
    async _updateDisplay() {
        if (!this.isPageLoaded) return;

        try {
            const settings = this.settingsManager.getAllSettings();
            await this.displayManager.updateDisplay(
                this.currentItemId,
                settings,
                this.apiClient
            );
        } catch (error) {
            console.error('Failed to update display:', error);
        }
    }

    /**
     * Handle settings change
     */
    _onSettingsChange() {
        this.isUserInteraction = true;
        this._applySettingsToUI();
    }

    /**
     * Setup check button
     */
    _setupCheckButton() {
        const checkButton = document.getElementById('checkButton');
        if (checkButton) {
            checkButton.addEventListener('click', () => {
                this._checkAnswer();
            });
        }
    }

    /**
     * Check user answer
     */
    async _checkAnswer() {
        try {
            const userAnswers = this.inputManager.getInputValues();
            const settings = this.settingsManager.getAllSettings();
            
            // Get the first non-empty answer
            const userAnswer = Object.values(userAnswers).find(answer => answer.trim().length > 0);
            
            if (!userAnswer) {
                console.warn('No answer provided');
                return;
            }

            const response = await this.apiClient.checkAnswer(
                this.currentItemId,
                userAnswer,
                settings
            );

            this._handleAnswerResponse(response);
        } catch (error) {
            console.error('Failed to check answer:', error);
        }
    }

    /**
     * Handle answer response
     */
    _handleAnswerResponse(response) {
        // Clear input fields
        this.inputManager.clearInputValues();

        // Show feedback (this would be implemented by a feedback component)
        console.log('Answer response:', response);

        // Load next item
        this._loadNextItem();
    }

    /**
     * Load next flashcard item
     */
    async _loadNextItem() {
        try {
            const response = await this.apiClient.getNextItem();
            this.currentItemId = response.item_id;
            await this._loadFlashcard();
        } catch (error) {
            console.error('Failed to load next item:', error);
        }
    }

    /**
     * Get current statistics
     */
    async getStatistics() {
        try {
            return await this.apiClient.getStatistics();
        } catch (error) {
            console.error('Failed to get statistics:', error);
            return null;
        }
    }
}
