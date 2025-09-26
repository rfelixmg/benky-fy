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
    createInputFields(inputModes) {
        if (!this.container) {
            console.warn('Input container not found');
            return;
        }

        // Clear existing input fields
        this.clearInputFields();

        // Create new input fields
        inputModes.forEach((mode, index) => {
            const inputGroup = this._createInputGroup(mode, index);
            this.container.appendChild(inputGroup);
            this.inputFields.set(mode, inputGroup);
        });

        // Initialize event listeners
        this._initializeEventListeners();
    }

    /**
     * Clear all input fields
     */
    clearInputFields() {
        this.inputFields.forEach((group, mode) => {
            group.remove();
        });
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
     * Create input group for specific mode
     */
    _createInputGroup(mode, index) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const label = this._createLabel(mode);
        const input = this._createInput(mode, index);

        inputGroup.appendChild(label);
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
    _createInput(mode, index) {
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
        });
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
        }, 100);
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
