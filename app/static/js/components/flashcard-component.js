/**
 * Flashcard Component - Main flashcard logic and state management
 * Orchestrates all flashcard functionality
 */
import { SettingsManager } from '/static/js/core/settings-manager.js';
import { ApiClient } from '/static/js/core/api-client.js';
import { InputManager } from '/static/js/core/input-manager.js';
import { DisplayManager } from '/static/js/core/display-manager.js';
import { SettingsModal } from '/static/js/components/settings-modal.js';
import { HelpComponent } from '/static/js/components/help-modal.js';
import { ConjugationComponent } from '/static/js/components/conjugation-component.js';
export class FlashcardComponent {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.settingsManager = null;
        this.apiClient = null;
        this.inputManager = null;
        this.displayManager = null;
        this.settingsModal = null;
        this.helpModal = null;
        this.conjugationComponent = null;
        
        this.currentItemId = 1;
        this.isUserInteraction = false;
        this.isPageLoaded = false;
        this.currentMode = 'flashcard'; // 'flashcard' or 'conjugation'
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
            this.helpModal = new HelpComponent();
            this.conjugationComponent = new ConjugationComponent(this.apiClient, this.settingsManager);

            // Setup settings modal
            this.settingsModal.initialize(
                this.settingsManager,
                () => this._onSettingsChange()
            );

            // Setup help modal
            this.helpModal.initialize(this.moduleName, this.apiClient);

            // Initialize conjugation component
            await this.conjugationComponent.initialize();

            // Setup help toggle button
            this._setupHelpToggleButton();

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
        const toggleBtn = document.querySelector('.settings-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.settingsModal.toggle();
            });
        }
    }

    /**
     * Setup help toggle button
     */
    _setupHelpToggleButton() {
        const helpToggleBtn = document.getElementById('helpToggleBtn');
        if (helpToggleBtn) {
            helpToggleBtn.addEventListener('click', () => {
                this.helpModal.show(null, this.currentItemId);
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

            // Determine current mode
            const settings = this.settingsManager.getAllSettings();
            this.currentMode = settings.practiceMode || 'flashcard';

            // Load content based on mode
            if (this.currentMode === 'conjugation') {
                await this._loadConjugationItem();
            } else {
                await this._loadRandomItem();
            }

            // Setup check button
            this._setupCheckButton();
        } catch (error) {
            console.error('Failed to load initial content:', error);
        }
    }

    /**
     * Load a conjugation practice item
     */
    async _loadConjugationItem() {
        try {
            // Clear any existing feedback before loading new item
            this._clearFeedback();
            
            const conjugationData = await this.conjugationComponent.getRandomConjugationItem();
            this.currentItemId = conjugationData.item.id;
            
            // Update the display with conjugation prompt
            this._updateConjugationDisplay(conjugationData);
        } catch (error) {
            console.error('Failed to load conjugation item:', error);
            // Fallback to regular flashcard if conjugation fails
            await this._loadRandomItem();
        }
    }

    /**
     * Update display for conjugation mode
     */
    _updateConjugationDisplay(conjugationData) {
        const promptDisplay = document.getElementById('prompt-display');
        if (promptDisplay) {
            promptDisplay.innerHTML = `<div class="prompt-text">${conjugationData.prompt}</div>`;
        }
        
        // Update prompt script indicator
        const promptScriptElement = document.getElementById('prompt-script');
        if (promptScriptElement) {
            promptScriptElement.textContent = 'conjugation';
        }

        // Show practice mode indicator
        this._updatePracticeModeIndicator('conjugation');
    }

    /**
     * Update practice mode indicator
     */
    _updatePracticeModeIndicator(mode) {
        const indicator = document.getElementById('practiceModeIndicator');
        if (indicator) {
            if (mode === 'conjugation') {
                indicator.textContent = '🔄 Conjugation Practice';
                indicator.className = 'practice-mode-indicator conjugation';
                indicator.style.display = 'block';
            } else {
                indicator.style.display = 'none';
            }
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
            const response = await this.displayManager.updateDisplay(
                this.currentItemId,
                settings,
                this.apiClient
            );
            
            // Update help modal with current item data
            if (this.helpModal && response) {
                this.helpModal.updateItem(response);
            }

            // Hide practice mode indicator for regular flashcards
            this._updatePracticeModeIndicator('flashcard');
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
        
        // Check if practice mode changed
        const settings = this.settingsManager.getAllSettings();
        const newMode = settings.practiceMode || 'flashcard';
        
        if (newMode !== this.currentMode) {
            this.currentMode = newMode;
            // Reload content with new mode
            this._loadInitialContent();
        } else {
            // Just apply settings to UI
            this._applySettingsToUI();
        }
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
            
            // Check if any answer is provided
            const hasAnswer = Object.values(userAnswers).some(answer => answer.trim().length > 0);
            
            if (!hasAnswer) {
                console.warn('No answer provided');
                return;
            }

            let response;
            
            if (this.currentMode === 'conjugation') {
                // Handle conjugation answer checking
                const userInput = userAnswers.hiragana || userAnswers.romaji || Object.values(userAnswers)[0];
                response = await this.conjugationComponent.checkConjugationAnswer(userInput);
            } else {
                // Handle regular flashcard answer checking
                response = await this.apiClient.checkAnswer(
                    this.currentItemId,
                    userAnswers,
                    settings
                );
            }

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

        // Show feedback
        if (this.currentMode === 'conjugation') {
            this._showConjugationFeedback(response);
        } else {
            this._showFeedback(response);
        }

        // Load next item after feedback period
        setTimeout(() => {
            this._loadNextItem();
        }, 8000); // 8 second delay to show feedback
    }

    /**
     * Show feedback to user
     */
    _showFeedback(response) {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (!feedbackElement) {
            console.warn('Feedback element not found');
            return;
        }

        const results = response.results || {};
        
        // Count correct answers
        const correctCount = Object.values(results).filter(result => result.is_correct).length;
        const totalCount = Object.keys(results).length;
        
        // Determine feedback type and CSS class
        let feedbackClass = '';
        let headerText = '';
        
        if (correctCount === totalCount && totalCount > 0) {
            // All correct - GREEN
            feedbackClass = 'correct';
            headerText = '✅ Perfect! All answers correct!';
        } else if (correctCount > 0) {
            // Partial correct - ORANGE
            feedbackClass = 'partial';
            headerText = `🟠 Partial success! ${correctCount}/${totalCount} correct.`;
        } else {
            // All wrong - RED
            feedbackClass = 'incorrect';
            headerText = '❌ Incorrect answers.';
        }

        // Build table HTML
        let tableHTML = `
            <div class="feedback-header">${headerText}</div>
            <table class="feedback-table">
                <thead>
                    <tr>
                        <th>Input</th>
                        <th>Target</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Add table rows in the same order as input modes
        const inputModes = this.settingsManager.getAllSettings().inputModes;
        console.log('Input modes order:', inputModes);
        console.log('Backend results order:', Object.keys(results));
        
        inputModes.forEach(mode => {
            const result = results[mode];
            if (result) {
                const isCorrect = result.is_correct;
                const statusIcon = isCorrect ? '✅' : '❌';
                const statusText = isCorrect ? 'Correct' : 'Incorrect';
                
                tableHTML += `
                    <tr>
                        <td>${mode}</td>
                        <td>${result.correct_answer}</td>
                        <td>${statusIcon} ${statusText}</td>
                    </tr>
                `;
            }
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;

        // Add skip button to feedback
        tableHTML += `
            <div class="feedback-actions">
                <button type="button" class="skip-button" id="skipFeedbackBtn">Next Card →</button>
                <div class="skip-hint">Press Enter or click to continue</div>
            </div>
        `;

        // Update feedback element
        feedbackElement.innerHTML = tableHTML;
        feedbackElement.className = `feedback-message ${feedbackClass}`;
        feedbackElement.style.display = 'block';

        // Apply feedback class to flashcard module for background colors
        const flashcardModule = document.querySelector('.flashcard-module');
        if (flashcardModule) {
            // Remove any existing feedback classes
            flashcardModule.classList.remove('correct', 'incorrect', 'partial');
            // Add the new feedback class
            if (feedbackClass) {
                flashcardModule.classList.add(feedbackClass);
            }
        }

        // Setup skip functionality
        this._setupSkipFeedback();

        // Hide feedback after delay
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 8000); // 8 seconds to review the table
    }

    /**
     * Show conjugation feedback to user
     */
    _showConjugationFeedback(response) {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (!feedbackElement) {
            console.warn('Feedback element not found');
            return;
        }

        const isCorrect = response.is_correct;
        const feedbackClass = isCorrect ? 'correct' : 'incorrect';
        const headerText = isCorrect ? '✅ Correct!' : '❌ Incorrect';
        
        let feedbackHTML = `
            <div class="feedback-header">${headerText}</div>
            <div class="conjugation-feedback">
                <div class="feedback-item">
                    <strong>Your answer:</strong> ${response.user_input || 'No answer provided'}
                </div>
                <div class="feedback-item">
                    <strong>Correct answer:</strong> ${response.correct_answer || 'N/A'}
                </div>
                <div class="feedback-item">
                    <strong>Form:</strong> ${response.conjugation_form || 'N/A'}
                </div>
                ${response.feedback ? `<div class="feedback-item"><strong>Note:</strong> ${response.feedback}</div>` : ''}
            </div>
            <div class="feedback-actions">
                <button type="button" class="skip-button" id="skipFeedbackBtn">Next Card →</button>
                <div class="skip-hint">Press Enter or click to continue</div>
            </div>
        `;

        // Update feedback element
        feedbackElement.innerHTML = feedbackHTML;
        feedbackElement.className = `feedback-message ${feedbackClass}`;
        feedbackElement.style.display = 'block';

        // Apply feedback class to flashcard module for background colors
        const flashcardModule = document.querySelector('.flashcard-module');
        if (flashcardModule) {
            // Remove any existing feedback classes
            flashcardModule.classList.remove('correct', 'incorrect', 'partial');
            // Add the new feedback class
            if (feedbackClass) {
                flashcardModule.classList.add(feedbackClass);
            }
        }

        // Setup skip functionality
        this._setupSkipFeedback();

        // Hide feedback after delay
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 8000); // 8 seconds to review the feedback
    }

    /**
     * Clear feedback display and reset visual state
     */
    _clearFeedback() {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (feedbackElement) {
            feedbackElement.style.display = 'none';
            feedbackElement.innerHTML = '';
            feedbackElement.className = 'feedback-message';
        }

        // Remove feedback classes from flashcard module
        const flashcardModule = document.querySelector('.flashcard-module');
        if (flashcardModule) {
            flashcardModule.classList.remove('correct', 'incorrect', 'partial');
        }
    }

    /**
     * Setup skip feedback functionality
     */
    _setupSkipFeedback() {
        const skipButton = document.getElementById('skipFeedbackBtn');
        if (skipButton) {
            skipButton.addEventListener('click', () => {
                this._skipToNextItem();
            });
        }

        // Add keyboard listener for Enter key during feedback
        const handleSkipKeydown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this._skipToNextItem();
                // Remove listener after use
                document.removeEventListener('keydown', handleSkipKeydown);
            }
        };
        
        document.addEventListener('keydown', handleSkipKeydown);
    }

    /**
     * Skip to next item (early feedback skip)
     */
    _skipToNextItem() {
        // Clear feedback immediately
        this._clearFeedback();
        // Load next item
        this._loadNextItem();
    }

    /**
     * Load next flashcard item
     */
    async _loadNextItem() {
        try {
            // Clear any existing feedback before loading new item
            this._clearFeedback();
            
            if (this.currentMode === 'conjugation') {
                await this._loadConjugationItem();
            } else {
                const response = await this.apiClient.getNextItem();
                this.currentItemId = response.item_id;
                await this._loadFlashcard();
            }
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
