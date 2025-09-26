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
            this.currentItem = response;
            this.currentDisplayText = response.text;
            
            this._renderDisplayText(response.text);
            this._updateDisplayMode(response.mode);
            
            return response;
        } catch (error) {
            console.error('Failed to update display:', error);
            throw error;
        }
    }

    /**
     * Render display text in the container
     */
    _renderDisplayText(text) {
        if (!this.container) {
            console.warn('Display container not found');
            return;
        }

        // Find the display element (could be prompt-text or answer-text)
        const displayElement = this.container.querySelector('.prompt-text') || 
                              this.container.querySelector('.answer-text') ||
                              this.container;

        if (displayElement) {
            displayElement.innerHTML = text;
        }
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
