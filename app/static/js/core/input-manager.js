/**
 * Input Manager - Handles input field creation and management
 * Manages dynamic input fields based on settings
 */
import { convertRomajiToHiragana } from '/static/js/utils/romaji-converter.js';
export class InputManager {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.inputFields = new Map();
        this.conversionTimeout = null;
    }

    /**
     * Create input fields based on input modes
     */
    createInputFields(inputModes, currentMode = 'flashcard') {
        if (!this.container) {
            console.warn('Input container not found');
            return;
        }

        // Clear existing input fields
        this.clearInputFields();

        // Create table structure for consistent styling
        const table = document.createElement('table');
        table.className = 'input-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const requestHeaderCell = document.createElement('th');
        requestHeaderCell.textContent = 'Request';
        headerRow.appendChild(requestHeaderCell);
        
        const inputHeaderCell = document.createElement('th');
        inputHeaderCell.textContent = 'Input';
        headerRow.appendChild(inputHeaderCell);
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Create input fields for each mode
        inputModes.forEach((mode, index) => {
            const row = document.createElement('tr');
            row.className = 'input-form-row';
            
            // Add request label cell
            const requestCell = document.createElement('td');
            requestCell.className = 'input-request-cell';
            requestCell.textContent = this._getInputModeDisplayName(mode);
            row.appendChild(requestCell);
            
            // Add input cell
            const inputCell = document.createElement('td');
            inputCell.className = 'input-field-cell';
            
            const inputGroup = this._createInputGroup(mode, index, currentMode);
            inputCell.appendChild(inputGroup);
            row.appendChild(inputCell);
            
            tbody.appendChild(row);
            this.inputFields.set(mode, inputGroup);
        });
        
        table.appendChild(tbody);
        this.container.appendChild(table);

        // Initialize event listeners
        this._initializeEventListeners();
    }

    /**
     * Clear all input fields
     */
    clearInputFields() {
        // Remove the entire table if it exists
        const existingTable = this.container.querySelector('.input-table');
        if (existingTable) {
            existingTable.remove();
        }
        this.inputFields.clear();
    }

    /**
     * Get all input values
     */
    getInputValues() {
        const values = {};
        this.inputFields.forEach((group, mode) => {
            const input = group.querySelector('input');
            if (input) {
                values[mode] = input.value.trim();
            }
        });
        return values;
    }

    /**
     * Clear all input values
     */
    clearInputValues() {
        this.inputFields.forEach((group) => {
            const input = group.querySelector('input');
            if (input) {
                input.value = '';
            }
        });
    }

    /**
     * Check if any input has content
     */
    hasInputContent() {
        return Array.from(this.inputFields.values()).some(group => {
            const input = group.querySelector('input');
            return input && input.value.trim().length > 0;
        });
    }

    /**
     * Focus first input field
     */
    focusFirstInput() {
        const firstGroup = this.inputFields.values().next().value;
        if (firstGroup) {
            const input = firstGroup.querySelector('input');
            if (input) {
                input.focus();
            }
        }
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
     * Create input group for specific mode
     */
    _createInputGroup(mode, index, currentMode = 'flashcard') {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const input = this._createInput(mode, index, currentMode);
        inputGroup.appendChild(input);

        return inputGroup;
    }

    /**
     * Create label for input mode
     */
    _createLabel(mode) {
        const label = document.createElement('label');
        label.className = 'input-label';

        switch (mode) {
            case 'hiragana':
                label.setAttribute('for', 'user_hiragana');
                label.textContent = 'Type in romaji (auto-converts to hiragana)';
                break;
            case 'romaji':
                label.setAttribute('for', 'user_romaji');
                label.textContent = 'Type in romaji';
                break;
            default:
                label.setAttribute('for', `user_${mode}`);
                label.textContent = `Your answer (${mode}):`;
        }

        return label;
    }

    /**
     * Create input field for mode
     */
    _createInput(mode, index, currentMode = 'flashcard') {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `user_${mode}`;
        input.name = `user_${mode}`;
        input.className = 'answer-input';
        input.autocomplete = 'off';
        input.autocorrect = 'off';
        input.autocapitalize = 'off';
        input.spellcheck = false;

        switch (mode) {
            case 'hiragana':
                input.placeholder = 'Type in romaji...';
                break;
            case 'romaji':
                input.placeholder = 'Type in romaji...';
                break;
            default:
                input.placeholder = `Type ${mode}...`;
        }

        // Disable flashcard inputs when in conjugation mode
        if (currentMode === 'conjugation') {
            input.disabled = true;
            input.classList.add('disabled-input');
        }

        if (index === 0) {
            input.autofocus = true;
        }

        return input;
    }

    /**
     * Initialize event listeners for input fields
     */
    _initializeEventListeners() {
        this.inputFields.forEach((group, mode) => {
            const input = group.querySelector('input');
            if (!input) return;

            // Input change handler
            input.addEventListener('input', () => {
                this._handleInputChange(mode, input);
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
     * Handle ENTER key press
     */
    _handleEnterKey() {
        const checkButton = document.getElementById('checkButton');
        if (checkButton && !checkButton.disabled) {
            checkButton.click();
        }
    }

    /**
     * Handle input change for specific mode
     */
    _handleInputChange(mode, input) {
        if (mode === 'hiragana') {
            this._handleHiraganaConversion(input);
        }
        this._updateCheckButtonState();
    }

    /**
     * Handle romaji to hiragana conversion
     */
    _handleHiraganaConversion(input) {
        if (this.conversionTimeout) {
            clearTimeout(this.conversionTimeout);
        }

        this.conversionTimeout = setTimeout(() => {
            const cursorPos = input.selectionStart;
            const originalValue = input.value;
            const convertedValue = this._convertRomajiToHiragana(originalValue);

            if (convertedValue !== originalValue) {
                input.value = convertedValue;
                const newCursorPos = Math.min(cursorPos, convertedValue.length);
                input.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 300); // Increased delay to 300ms for better user experience
    }

    /**
     * Convert romaji to hiragana (basic implementation)
     */
    _convertRomajiToHiragana(romajiText) {
        // Use the imported romaji converter utility
        return convertRomajiToHiragana(romajiText);
    }

    /**
     * Update check button state based on input content
     */
    _updateCheckButtonState() {
        const checkButton = document.getElementById('checkButton');
        if (checkButton) {
            checkButton.disabled = !this.hasInputContent();
        }
    }
}
