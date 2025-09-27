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
            console.log('Initializing conjugation component...');
            await this.conjugationComponent.initialize();
            console.log('Conjugation component initialized');

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
            console.log('Initial settings loaded:', settings);
            this.currentMode = settings.practiceMode || 'flashcard';
            console.log('Initial mode set to:', this.currentMode);

            // Load content based on mode
            if (this.currentMode === 'conjugation') {
                console.log('Loading conjugation item on initial load');
                await this._loadConjugationItem();
            } else {
                console.log('Loading regular flashcard on initial load');
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
            console.log('Loading conjugation item...');
            // Clear any existing feedback before loading new item
            this._clearFeedback();
            
            const conjugationData = await this.conjugationComponent.getRandomConjugationItem();
            console.log('Conjugation data received:', conjugationData);
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
            // Create multiple prompts for each conjugation form
            let promptsHTML = '';
            conjugationData.prompts.forEach((promptData, index) => {
                promptsHTML += `
                    <div class="conjugation-prompt-item">
                        <div class="conjugation-form-label">${promptData.formName}</div>
                        <div class="conjugation-prompt-text">${promptData.prompt}</div>
                    </div>
                `;
            });
            
            promptDisplay.innerHTML = `<div class="prompt-text">${promptsHTML}</div>`;
        }
        
        // Update prompt script indicator
        const promptScriptElement = document.getElementById('prompt-script');
        if (promptScriptElement) {
            promptScriptElement.textContent = 'conjugation';
        }

        // Show practice mode indicator
        this._updatePracticeModeIndicator('conjugation');
        
        // Create input fields for each conjugation form
        this._createConjugationInputFields(conjugationData.conjugationForms);
    }

    /**
     * Create input fields for multiple conjugation forms
     */
    _createConjugationInputFields(conjugationForms) {
        const answerSection = document.querySelector('.answer-section');
        if (!answerSection) return;

        // Clear existing input fields
        answerSection.innerHTML = '';

        // Get current input modes from settings
        const settings = this.settingsManager.getAllSettings();
        const inputModes = settings.inputModes || ['hiragana'];
        console.log('Creating conjugation inputs for modes:', inputModes);

        // Create input fields for each conjugation form
        conjugationForms.forEach((form, index) => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'conjugation-input-group';
            
            const label = document.createElement('label');
            label.className = 'conjugation-input-label';
            label.textContent = this._getFormDisplayName(form);
            label.setAttribute('for', `conjugation_${form}`);
            
            inputGroup.appendChild(label);

            // Create input fields for each selected input mode
            inputModes.forEach((inputMode, modeIndex) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `conjugation_${form}_${inputMode}`;
                input.name = `conjugation_${form}_${inputMode}`;
                input.className = 'conjugation-input';
                input.placeholder = this._getInputPlaceholder(inputMode, form);
                input.autocomplete = 'off';
                input.autocorrect = 'off';
                input.autocapitalize = 'off';
                input.spellcheck = false;
                
                // Set focus on first input of first form
                if (index === 0 && modeIndex === 0) {
                    input.autofocus = true;
                }
                
                inputGroup.appendChild(input);
            });
            
            answerSection.appendChild(inputGroup);
        });

        // Setup event listeners for conjugation inputs
        this._setupConjugationInputListeners();
    }

    /**
     * Get placeholder text for input mode
     */
    _getInputPlaceholder(inputMode, form) {
        switch (inputMode) {
            case 'hiragana':
                return `Type ${form} form in hiragana (romaji input)...`;
            case 'kanji':
                return `Type ${form} form in kanji...`;
            default:
                return `Type ${form} form...`;
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
     * Setup event listeners for conjugation input fields
     */
    _setupConjugationInputListeners() {
        const conjugationInputs = document.querySelectorAll('.conjugation-input');
        
        conjugationInputs.forEach(input => {
            // Input change handler for romaji conversion
            input.addEventListener('input', () => {
                this._handleConjugationInputChange(input);
            });

            // Keyup handler for button state
            input.addEventListener('keyup', () => {
                this._updateCheckButtonState();
            });

            // Keydown handler for ENTER key
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this._handleEnterKey();
                }
            });
        });
    }

    /**
     * Update check button state based on input content
     */
    _updateCheckButtonState() {
        const checkButton = document.getElementById('checkButton');
        if (!checkButton) return;

        let hasContent = false;

        if (this.currentMode === 'conjugation') {
            // Check conjugation inputs
            const conjugationInputs = document.querySelectorAll('.conjugation-input');
            hasContent = Array.from(conjugationInputs).some(input => 
                input.value.trim().length > 0
            );
        } else {
            // Check regular inputs
            hasContent = this.inputManager.hasInputContent();
        }

        checkButton.disabled = !hasContent;
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
        
        console.log('Settings changed. Current mode:', this.currentMode, 'New mode:', newMode);
        
        if (newMode !== this.currentMode) {
            console.log('Mode changed from', this.currentMode, 'to', newMode);
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
            let response;
            
            if (this.currentMode === 'conjugation') {
                // Handle conjugation answer checking
                const userAnswers = this._getConjugationInputValues();
                console.log('Conjugation user answers:', userAnswers);
                
                // Check if any answer is provided
                const hasAnswer = Object.values(userAnswers).some(answer => answer.trim().length > 0);
                
                if (!hasAnswer) {
                    console.warn('No conjugation answer provided');
                    return;
                }
                
                response = await this.conjugationComponent.checkConjugationAnswers(userAnswers);
            } else {
                // Handle regular flashcard answer checking
                const userAnswers = this.inputManager.getInputValues();
                const settings = this.settingsManager.getAllSettings();
                
                // Check if any answer is provided
                const hasAnswer = Object.values(userAnswers).some(answer => answer.trim().length > 0);
                
                if (!hasAnswer) {
                    console.warn('No answer provided');
                    return;
                }

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
     * Get conjugation input values
     */
    _getConjugationInputValues() {
        const values = {};
        const conjugationInputs = document.querySelectorAll('.conjugation-input');
        
        conjugationInputs.forEach(input => {
            const nameParts = input.name.split('_');
            const form = nameParts[1]; // conjugation_form_mode -> form
            const mode = nameParts[2]; // conjugation_form_mode -> mode
            
            if (!values[form]) {
                values[form] = {};
            }
            
            if (input.value.trim().length > 0) {
                values[form][mode] = input.value.trim();
            }
        });
        
        return values;
    }

    /**
     * Handle answer response
     */
    _handleAnswerResponse(response) {
        // Clear input fields
        if (this.currentMode === 'conjugation') {
            this._clearConjugationInputValues();
        } else {
            this.inputManager.clearInputValues();
        }

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
     * Clear conjugation input values
     */
    _clearConjugationInputValues() {
        const conjugationInputs = document.querySelectorAll('.conjugation-input');
        conjugationInputs.forEach(input => {
            input.value = '';
        });
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
    _showConjugationFeedback(results) {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (!feedbackElement) {
            console.warn('Feedback element not found');
            return;
        }

        // Calculate overall results
        const correctCount = results.filter(r => r.result.is_correct).length;
        const totalCount = results.length;
        
        let feedbackClass = '';
        let headerText = '';
        
        if (correctCount === totalCount && totalCount > 0) {
            feedbackClass = 'correct';
            headerText = `✅ Perfect! All ${totalCount} conjugations correct!`;
        } else if (correctCount > 0) {
            feedbackClass = 'partial';
            headerText = `🟠 Partial success! ${correctCount}/${totalCount} conjugations correct.`;
        } else {
            feedbackClass = 'incorrect';
            headerText = '❌ Incorrect conjugations.';
        }
        
        let feedbackHTML = `
            <div class="feedback-header">${headerText}</div>
            <div class="conjugation-feedback">
        `;
        
        // Add results for each conjugation form
        results.forEach(result => {
            const isCorrect = result.result.is_correct;
            const statusIcon = isCorrect ? '✅' : '❌';
            const modeDisplay = result.mode ? ` (${result.mode})` : '';
            
            feedbackHTML += `
                <div class="conjugation-result-item">
                    <div class="conjugation-result-header">
                        <span class="conjugation-form-name">${result.formName}${modeDisplay}</span>
                        <span class="conjugation-status">${statusIcon}</span>
                    </div>
                    <div class="conjugation-result-details">
                        <div class="conjugation-detail">
                            <strong>Your answer:</strong> ${result.userInput || 'No answer provided'}
                        </div>
                        <div class="conjugation-detail">
                            <strong>Correct answer:</strong> ${result.result.correct_answer || 'N/A'}
                        </div>
                        ${result.result.feedback ? `<div class="conjugation-detail"><strong>Note:</strong> ${result.result.feedback}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        feedbackHTML += `
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
        }, 10000); // 10 seconds to review multiple conjugations
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
