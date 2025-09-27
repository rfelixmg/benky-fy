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
        
        // Timer management
        this.feedbackTimer = null;
        this.countdownTimer = null;
        this.countdownSeconds = 0;
        this.skipKeydownHandler = null;
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
            // Determine current mode first
            const settings = this.settingsManager.getAllSettings();
            this.currentMode = settings.practiceMode || 'flashcard';

            // Check if conjugation is supported for this module
            const conjugationSupported = this.settingsManager.isConjugationSupported();

            // If conjugation mode is selected but not supported, fallback to flashcard mode
            if (this.currentMode === 'conjugation' && !conjugationSupported) {
                this.currentMode = 'flashcard';
                this.settingsManager.updateSetting('practiceMode', 'flashcard');
            }

            // Load settings into UI with correct mode
            this._applySettingsToUI();

            // Load content based on mode
            if (this.currentMode === 'conjugation' && conjugationSupported) {
                await this._loadConjugationItem();
            } else {
                // Get a random item for initial load
                const response = await this.apiClient.getNextItem();
                this.currentItemId = response.item_id;
                await this._loadFlashcard();
            }

            // Setup check button
            this._setupCheckButton();
        } catch (error) {
            console.error('Failed to load initial content:', error);
            // Fallback to regular flashcard if anything fails
            try {
                await this._loadFlashcard();
                this._setupCheckButton();
            } catch (fallbackError) {
                console.error('Fallback flashcard loading also failed:', fallbackError);
            }
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
            await this._loadFlashcard();
        }
    }

    /**
     * Update display for conjugation mode - show single verb with multiple input forms
     */
    _updateConjugationDisplay(conjugationData) {
        const promptDisplay = document.getElementById('prompt-display');
        if (promptDisplay) {
            // Show only the single verb based on prompt style
            const settings = this.settingsManager.getAllSettings();
            const promptStyle = settings.conjugationPromptStyle || 'english';
            const item = conjugationData.item;
            
            let verbDisplay = '';
            if (promptStyle === 'kanji') {
                verbDisplay = item.kanji;
            } else if (promptStyle === 'furigana') {
                verbDisplay = item.hiragana;
            } else {
                verbDisplay = item.english;
            }
            
            promptDisplay.innerHTML = `<div class="prompt-text">${verbDisplay}</div>`;
        }
        
        // Update prompt script indicator
        const promptScriptElement = document.getElementById('prompt-script');
        if (promptScriptElement) {
            promptScriptElement.textContent = 'conjugation';
        }

        // Show practice mode indicator
        this._updatePracticeModeIndicator('conjugation');
        
        // Update header title for conjugation mode
        this._updateHeaderTitle('conjugation');
        
        // Create input fields for each conjugation form
        this._createConjugationInputFields(conjugationData.conjugationForms);
    }

    /**
     * Create input fields for multiple conjugation forms in table format
     */
    _createConjugationInputFields(conjugationForms) {
        const answerSection = document.querySelector('.answer-section');
        if (!answerSection) return;

        // Clear existing input fields completely
        answerSection.innerHTML = '';

        // Get current input modes from settings
        const settings = this.settingsManager.getAllSettings();
        const inputModes = settings.inputModes || ['hiragana'];
        console.log('Creating conjugation inputs for modes:', inputModes);

        // Create table structure
        const table = document.createElement('table');
        table.className = 'conjugation-input-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Add empty cell for conjugation form column
        const formHeaderCell = document.createElement('th');
        formHeaderCell.textContent = 'Conjugation Form';
        headerRow.appendChild(formHeaderCell);
        
        // Add header cells for each input mode
        inputModes.forEach(inputMode => {
            const headerCell = document.createElement('th');
            headerCell.textContent = this._getInputModeDisplayName(inputMode);
            headerRow.appendChild(headerCell);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Create input fields for each conjugation form
        conjugationForms.forEach((form, formIndex) => {
            const row = document.createElement('tr');
            row.className = 'conjugation-form-row';
            
            // Add conjugation form label cell
            const formCell = document.createElement('td');
            formCell.className = 'conjugation-form-label-cell';
            formCell.textContent = this._getFormDisplayName(form);
            row.appendChild(formCell);
            
            // Add input cells for each input mode
            inputModes.forEach((inputMode, modeIndex) => {
                const inputCell = document.createElement('td');
                inputCell.className = 'conjugation-input-cell';
                
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
                
                // Disable conjugation inputs when in flashcard mode
                if (this.currentMode === 'flashcard') {
                    input.disabled = true;
                    input.classList.add('disabled-input');
                }
                
                // Set focus on first input of first form
                if (formIndex === 0 && modeIndex === 0) {
                    input.autofocus = true;
                }
                
                inputCell.appendChild(input);
                row.appendChild(inputCell);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        answerSection.appendChild(table);

        // Setup event listeners for conjugation inputs with InputManager features
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
     * Get display name for input mode
     */
    _getInputModeDisplayName(inputMode) {
        const modeNames = {
            'hiragana': 'Hiragana',
            'kanji': 'Kanji',
            'romaji': 'Romaji',
            'katakana': 'Katakana',
            'english': 'English'
        };
        return modeNames[inputMode] || inputMode;
    }

    /**
     * Setup event listeners for conjugation input fields with InputManager features
     */
    _setupConjugationInputListeners() {
        const conjugationInputs = document.querySelectorAll('.conjugation-input');
        
        conjugationInputs.forEach(input => {
            // Input change handler with romaji conversion
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
                    this._handleConjugationEnterKey();
                }
            });
        });
    }

    /**
     * Handle conjugation input change with InputManager features
     */
    _handleConjugationInputChange(input) {
        // Extract input mode from input ID
        const inputId = input.id;
        const parts = inputId.split('_');
        const inputMode = parts[parts.length - 1]; // Last part is the input mode
        
        // Apply InputManager features based on input mode
        if (inputMode === 'hiragana') {
            this._handleHiraganaConversion(input);
        } else if (inputMode === 'katakana') {
            this._handleKatakanaConversion(input);
        }
        
        // Update check button state
        this._updateCheckButtonState();
    }

    /**
     * Handle romaji to hiragana conversion for conjugation inputs
     */
    _handleHiraganaConversion(input) {
        // Use the same timeout mechanism as InputManager
        if (this.conjugationConversionTimeout) {
            clearTimeout(this.conjugationConversionTimeout);
        }

        this.conjugationConversionTimeout = setTimeout(() => {
            const cursorPos = input.selectionStart;
            const originalValue = input.value;
            const convertedValue = this._convertRomajiToHiragana(originalValue);

            if (convertedValue !== originalValue) {
                input.value = convertedValue;
                const newCursorPos = Math.min(cursorPos, convertedValue.length);
                input.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 300); // Same 300ms delay as InputManager
    }

    /**
     * Convert romaji to hiragana (using the same implementation as InputManager)
     */
    _convertRomajiToHiragana(romajiText) {
        // Use the globally available romaji converter
        if (window.convertRomajiToHiragana) {
            return window.convertRomajiToHiragana(romajiText);
        }
        return romajiText; // Fallback if converter not available
    }

    /**
     * Handle katakana to hiragana conversion for conjugation inputs
     */
    _handleKatakanaConversion(input) {
        // Use the same timeout mechanism as InputManager
        if (this.conjugationConversionTimeout) {
            clearTimeout(this.conjugationConversionTimeout);
        }

        this.conjugationConversionTimeout = setTimeout(() => {
            const cursorPos = input.selectionStart;
            const originalValue = input.value;
            const convertedValue = this._convertRomajiToKatakana(originalValue);

            if (convertedValue !== originalValue) {
                input.value = convertedValue;
                const newCursorPos = Math.min(cursorPos, convertedValue.length);
                input.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 300); // Same 300ms delay as InputManager
    }

    /**
     * Convert romaji to katakana (using the same implementation as InputManager)
     */
    _convertRomajiToKatakana(romajiText) {
        // Use the globally available katakana converter
        if (window.convertRomajiToKatakana) {
            return window.convertRomajiToKatakana(romajiText);
        }
        return romajiText; // Fallback if converter not available
    }

    /**
     * Handle ENTER key press for conjugation inputs
     */
    _handleConjugationEnterKey() {
        const checkButton = document.getElementById('checkButton');
        if (checkButton && !checkButton.disabled) {
            checkButton.click();
        }
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
        
        // Only create flashcard input fields when in flashcard mode
        if (this.currentMode === 'flashcard') {
            // Clear any conjugation elements first when switching to flashcard mode
            this._clearConjugationElements();
            this.inputManager.createInputFields(settings.inputModes, this.currentMode);
        } else {
            // Clear flashcard inputs when in conjugation mode
            this.inputManager.clearInputFields();
        }
        
        // Update display
        this._updateDisplay();
    }

    /**
     * Load flashcard content
     */
    async _loadFlashcard() {
        try {
            // Clear any conjugation elements first
            this._clearConjugationElements();
            
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

            // Create flashcard input fields
            this.inputManager.createInputFields(settings.inputModes, 'flashcard');

            // Hide practice mode indicator for regular flashcards
            this._updatePracticeModeIndicator('flashcard');
            
            // Reset prompt script indicator to default
            this._resetPromptScriptIndicator();
            
            // Update header title for flashcard mode
            this._updateHeaderTitle('flashcard');
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
        
        console.log('Settings changed. Mode:', newMode);
        
        // Check if conjugation is supported for this module
        const conjugationSupported = this.settingsManager.isConjugationSupported();
        
        // If trying to switch to conjugation mode but not supported, revert to flashcard
        if (newMode === 'conjugation' && !conjugationSupported) {
            console.log('Conjugation not supported for this module, reverting to flashcard mode');
            this.settingsManager.updateSetting('practiceMode', 'flashcard');
            return; // Exit early, settings will be updated
        }
        
        if (newMode !== this.currentMode) {
            console.log('Mode changed from', this.currentMode, 'to', newMode);
            
            // Clear all existing inputs first
            this.inputManager.clearInputFields();
            
            // Update current mode
            this.currentMode = newMode;
            
            // Update header title immediately
            this._updateHeaderTitle(newMode);
            
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
                const hasAnswer = Object.values(userAnswers).some(formAnswers => 
                    Object.values(formAnswers).some(answer => answer && answer.trim().length > 0)
                );
                
                if (!hasAnswer) {
                    console.warn('No conjugation answer provided');
                    return;
                }
                
                response = await this.conjugationComponent.checkConjugationAnswers(userAnswers);
                this._handleAnswerResponse(response, userAnswers);
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
                this._handleAnswerResponse(response, userAnswers);
            }
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
        
        console.log('Collected conjugation input values:', values);
        return values;
    }

    /**
     * Handle answer response
     */
    _handleAnswerResponse(response, userAnswers = null) {
        // Clear any existing feedback timer
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
            this.feedbackTimer = null;
        }

        // Clear input fields
        if (this.currentMode === 'conjugation') {
            this._clearConjugationInputValues();
        } else {
            this.inputManager.clearInputValues();
        }

        // Show feedback
        if (this.currentMode === 'conjugation') {
            this._showConjugationFeedback(response, userAnswers);
        } else {
            this._showFeedback(response, userAnswers);
        }

        // Set timer to load next item after feedback period
        this.countdownSeconds = 8; // 8 second delay to show feedback
        this._startCountdownTimer();
        
        this.feedbackTimer = setTimeout(() => {
            console.log('Automatic timer expired - loading next item');
            this._loadNextItem();
            this.feedbackTimer = null;
        }, 10000);
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
    _showFeedback(response, userAnswers = null) {
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

        // Build table HTML with consistent format: User Input | Expected | Result
        let tableHTML = `
            <div class="feedback-header">${headerText}</div>
            <table class="feedback-table">
                <thead>
                    <tr>
                        <th>Request Type</th>
                        <th>User Input</th>
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
                const userInput = userAnswers && userAnswers[mode] ? userAnswers[mode] : 'No input';
                
                tableHTML += `
                    <tr>
                        <td>${mode}</td>
                        <td>${userInput}</td>
                        <td>${result.correct_answer}</td>
                        <td>${statusIcon}</td>
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
        }, 10000); // 8 seconds to review the table
    }

    /**
     * Show conjugation feedback to user
     */
    _showConjugationFeedback(results, userAnswers = null) {
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
        
        // Build table HTML with consistent format: Request Type | User Input | Target | Result
        let tableHTML = `
            <div class="feedback-header">${headerText}</div>
            <table class="feedback-table">
                <thead>
                    <tr>
                        <th>Request Type</th>
                        <th>User Input</th>
                        <th>Target</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Add results for each conjugation form in the same order as requested
        results.forEach(result => {
            const isCorrect = result.result.is_correct;
            const statusIcon = isCorrect ? '✅' : '❌';
            const modeDisplay = result.mode ? ` (${result.mode})` : '';
            const userInput = result.userInput || 'No input';
            
            tableHTML += `
                <tr>
                    <td>${result.formName}${modeDisplay}</td>
                    <td>${userInput}</td>
                    <td>${result.result.correct_answer || 'N/A'}</td>
                    <td>${statusIcon}</td>
                </tr>
            `;
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
        }, 10000); // 10 seconds to review multiple conjugations
    }

    /**
     * Clear feedback display and reset visual state
     */
    _clearFeedback() {
        // Clear the automatic feedback timer
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
            this.feedbackTimer = null;
        }
        
        // Stop countdown timer
        this._stopCountdownTimer();
        
        // Remove keyboard listener for skip functionality
        if (this.skipKeydownHandler) {
            document.removeEventListener('keydown', this.skipKeydownHandler);
            this.skipKeydownHandler = null;
        }
        
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
        // Store reference to handler for cleanup
        this.skipKeydownHandler = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this._skipToNextItem();
            }
        };
        
        document.addEventListener('keydown', this.skipKeydownHandler);
    }

    /**
     * Start countdown timer display
     */
    _startCountdownTimer() {
        this._updateCountdownDisplay();
        
        this.countdownTimer = setInterval(() => {
            this.countdownSeconds--;
            this._updateCountdownDisplay();
            
            if (this.countdownSeconds <= 0) {
                this._stopCountdownTimer();
            }
        }, 1000);
    }

    /**
     * Stop countdown timer display
     */
    _stopCountdownTimer() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        this._hideCountdownDisplay();
    }

    /**
     * Update countdown display
     */
    _updateCountdownDisplay() {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (!feedbackElement) return;

        // Find or create countdown element
        let countdownElement = feedbackElement.querySelector('.countdown-timer');
        if (!countdownElement) {
            countdownElement = document.createElement('div');
            countdownElement.className = 'countdown-timer';
            countdownElement.innerHTML = `
                <div class="countdown-text">Next card in:</div>
                <div class="countdown-number">${this.countdownSeconds}</div>
            `;
            feedbackElement.appendChild(countdownElement);
        } else {
            const numberElement = countdownElement.querySelector('.countdown-number');
            if (numberElement) {
                numberElement.textContent = this.countdownSeconds;
            }
        }
    }

    /**
     * Hide countdown display
     */
    _hideCountdownDisplay() {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (feedbackElement) {
            const countdownElement = feedbackElement.querySelector('.countdown-timer');
            if (countdownElement) {
                countdownElement.remove();
            }
        }
    }

    /**
     * Skip to next item (early feedback skip)
     */
    _skipToNextItem() {
        console.log('User skipped feedback - stopping timers and loading next item');
        
        // Clear the automatic feedback timer
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
            this.feedbackTimer = null;
        }
        
        // Stop countdown timer
        this._stopCountdownTimer();
        
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

    /**
     * Clear conjugation-specific elements from display
     */
    _clearConjugationElements() {
        // Clear any conjugation-specific CSS classes
        const flashcardContainer = document.querySelector('.flashcard-container');
        if (flashcardContainer) {
            flashcardContainer.classList.remove('conjugation-mode');
        }
        
        // Clear conjugation input table (created by _createConjugationInputFields)
        const conjugationInputTable = document.querySelector('.conjugation-input-table');
        if (conjugationInputTable) {
            conjugationInputTable.remove();
        }
        
        // Clear all conjugation-related elements comprehensively
        const conjugationElements = document.querySelectorAll(`
            .conjugation-input-group,
            .conjugation-prompt-item,
            .conjugation-form-label,
            .conjugation-prompt-text,
            .conjugation-form-row,
            .conjugation-form-label-cell,
            .conjugation-input-cell,
            .conjugation-input
        `);
        conjugationElements.forEach(element => element.remove());
        
        // Clear practice mode indicator if it's in conjugation mode
        const practiceModeIndicator = document.getElementById('practiceModeIndicator');
        if (practiceModeIndicator && practiceModeIndicator.classList.contains('conjugation')) {
            practiceModeIndicator.style.display = 'none';
            practiceModeIndicator.classList.remove('conjugation');
        }
    }

    /**
     * Reset prompt script indicator to default
     */
    _resetPromptScriptIndicator() {
        const promptScriptElement = document.getElementById('prompt-script');
        if (promptScriptElement) {
            // Reset to default based on current display mode
            const settings = this.settingsManager.getAllSettings();
            const displayMode = settings.displayMode || 'kana';
            
            switch (displayMode) {
                case 'kana':
                    promptScriptElement.textContent = 'hiragana';
                    break;
                case 'kanji':
                    promptScriptElement.textContent = 'kanji';
                    break;
                case 'kanji_furigana':
                    promptScriptElement.textContent = 'kanji + furigana';
                    break;
                case 'english':
                    promptScriptElement.textContent = 'english';
                    break;
                case 'weighted':
                    promptScriptElement.textContent = 'mixed';
                    break;
                default:
                    promptScriptElement.textContent = 'hiragana';
            }
        }
    }

    /**
     * Update header title based on practice mode
     */
    _updateHeaderTitle(mode) {
        const headerTitle = document.getElementById('headerTitle');
        if (headerTitle) {
            const moduleName = this.moduleName || 'Verbs'; // Fallback to 'Verbs' if moduleName not available
            const formattedModuleName = moduleName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            if (mode === 'conjugation') {
                headerTitle.textContent = `${formattedModuleName} Conjugation`;
            } else {
                headerTitle.textContent = `${formattedModuleName} Flashcards`;
            }
        }
    }
}
