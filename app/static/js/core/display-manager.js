/**
 * Display Manager - Handles display mode changes and text rendering
 * Manages the display of flashcard content based on settings
 */
export class DisplayManager {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.currentItem = null;
        this.currentDisplayText = '';
    }

    /**
     * Update display based on settings
     */
    async updateDisplay(itemId, settings, apiClient) {
        try {
            const response = await apiClient.getDisplayText(itemId, settings);
            
            // Validate response
            if (!response || !response.text) {
                throw new Error('Invalid response from display API');
            }
            
            this.currentItem = response;
            this.currentDisplayText = response.text;
            
            this._renderDisplayText(response.text, settings);
            this._updateDisplayMode(response.mode);
            
            return response;
        } catch (error) {
            console.error('Failed to update display:', error);
            this.showError(`Failed to load content: ${error.message}`);
            throw error;
        }
    }

    /**
     * Render display text in the container
     */
    _renderDisplayText(text, settings = null) {
        if (!this.container) {
            console.warn('Display container not found');
            return;
        }

        // Find the display element (could be prompt-text or answer-text)
        const displayElement = this.container.querySelector('.prompt-text') || 
                              this.container.querySelector('.answer-text') ||
                              this.container;

        if (displayElement) {
            // Apply furigana style transformation if settings are provided
            let processedText = text;
            if (settings && settings.furiganaStyle && settings.furiganaStyle !== 'ruby') {
                processedText = this._applyFuriganaStyle(text, settings.furiganaStyle);
            }
            
            displayElement.innerHTML = processedText;
            
        }
    }

    /**
     * Apply furigana style transformation
     */
    _applyFuriganaStyle(text, style) {
        if (!text || style === 'ruby') {
            return text;
        }

        // Simple regex-based conversion
        const rubyRegex = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
        return text.replace(rubyRegex, (match, kanji, furigana) => {
            switch (style) {
                case 'brackets':
                    return `${kanji}[${furigana}]`;
                case 'hover':
                    return `<span class="furigana-hover" title="${furigana}">${kanji}</span>`;
                case 'inline':
                    return `${kanji} (${furigana})`;
                default:
                    return kanji;
            }
        });
    }

    /**
     * Update display mode indicators
     */
    _updateDisplayMode(mode) {
        // Update any mode indicators in the UI
        const modeElements = document.querySelectorAll('.display-mode-indicator');
        modeElements.forEach(element => {
            element.textContent = mode;
        });
        
        // Update the prompt script indicator
        const promptScriptElement = document.getElementById('prompt-script');
        if (promptScriptElement) {
            // Map display modes to user-friendly script names
            const scriptNames = {
                'kana': 'hiragana',
                'kanji': 'kanji',
                'kanji_furigana': 'kanji+furigana',
                'weighted': 'weighted',
                'english': 'english'
            };
            
            const scriptName = scriptNames[mode] || mode;
            promptScriptElement.textContent = scriptName;
        }
    }

    /**
     * Get current display text
     */
    getCurrentDisplayText() {
        return this.currentDisplayText;
    }

    /**
     * Get current item data
     */
    getCurrentItem() {
        return this.currentItem;
    }

    /**
     * Clear display
     */
    clearDisplay() {
        if (this.container) {
            const displayElement = this.container.querySelector('.prompt-text') || 
                                  this.container.querySelector('.answer-text') ||
                                  this.container;
            if (displayElement) {
                displayElement.innerHTML = '';
            }
        }
        this.currentItem = null;
        this.currentDisplayText = '';
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.container) {
            const displayElement = this.container.querySelector('.prompt-text') || 
                                  this.container.querySelector('.answer-text') ||
                                  this.container;
            if (displayElement) {
                displayElement.innerHTML = '<div class="loading">Loading...</div>';
            }
        }
    }

    /**
     * Show error state
     */
    showError(message) {
        if (this.container) {
            const displayElement = this.container.querySelector('.prompt-text') || 
                                  this.container.querySelector('.answer-text') ||
                                  this.container;
            if (displayElement) {
                displayElement.innerHTML = `<div class="error">Error: ${message}</div>`;
            }
        }
    }
}
