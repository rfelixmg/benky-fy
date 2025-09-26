// Import the main flashcard application
import { FlashcardComponent } from './components/flashcard-component.js';
import { SettingsManager } from './core/settings-manager.js';
import { ApiClient } from './core/api-client.js';
import { InputManager } from './core/input-manager.js';
import { DisplayManager } from './core/display-manager.js';
import { SettingsModal } from './components/settings-modal.js';
import { convertRomajiToHiragana, romajiToHiragana } from './utils/romaji-converter.js';
import { FuriganaRenderer } from './utils/furigana-renderer.js';
import { ValidationUtils } from './utils/validation.js';

/**
 * Flashcard Application Class
 * Main application controller
 */
class FlashcardApp {
    constructor() {
        this.moduleName = this._getModuleName();
        this.flashcardComponent = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        try {
            console.log(`Initializing flashcard app for module: ${this.moduleName}`);

            // Create and initialize flashcard component
            this.flashcardComponent = new FlashcardComponent(this.moduleName);
            await this.flashcardComponent.initialize();

            this.isInitialized = true;
            console.log('Flashcard application initialized successfully');

        } catch (error) {
            console.error('Failed to initialize flashcard application:', error);
            this._showError('Failed to initialize application');
        }
    }

    /**
     * Get module name from the current page
     * @returns {string} - The module name
     */
    _getModuleName() {
        // Try to get module name from template variable
        const moduleNameElement = document.querySelector('meta[name="module-name"]');
        if (moduleNameElement) {
            return moduleNameElement.getAttribute('content');
        }

        // Fallback: extract from URL
        const path = window.location.pathname;
        const match = path.match(/\/begginer\/([^\/]+)/);
        if (match) {
            return match[1];
        }

        // Default fallback
        return 'unknown';
    }

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    _showError(message) {
        const errorContainer = document.querySelector('.error-container') || 
                              document.querySelector('.flashcard-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">Reload Page</button>
                </div>
            `;
        }
    }

    /**
     * Get application statistics
     * @returns {Object|null} - Statistics data or null if not available
     */
    async getStatistics() {
        if (!this.flashcardComponent) return null;
        return await this.flashcardComponent.getStatistics();
    }

    /**
     * Reload the application
     */
    async reload() {
        this.isInitialized = false;
        this.flashcardComponent = null;
        await this.initialize();
    }
}

// Global application instance
let flashcardApp = null;

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        flashcardApp = new FlashcardApp();
        await flashcardApp.initialize();
    } catch (error) {
        console.error('Failed to start flashcard application:', error);
    }
});

// Export for global access
export { FlashcardApp };
export default FlashcardApp;

window.FlashcardApp = FlashcardApp;
window.flashcardApp = flashcardApp;

// Export utilities for backward compatibility
window.convertRomajiToHiragana = convertRomajiToHiragana;
window.romajiToHiragana = romajiToHiragana;
window.FuriganaRenderer = FuriganaRenderer;
window.ValidationUtils = ValidationUtils;