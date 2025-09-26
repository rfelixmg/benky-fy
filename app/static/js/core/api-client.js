/**
 * API Client - Handles all backend communication
 * Manages API calls for display text, settings, and flashcard data
 */
export class ApiClient {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.baseUrl = `/begginer/${moduleName}`;
    }

    /**
     * Get display text for a flashcard item
     */
    async getDisplayText(itemId, settings) {
        try {
            const params = new URLSearchParams({
                item_id: itemId,
                display_mode: settings.displayMode,
                kana_type: settings.kanaTypes.join(','),
                furigana_style: settings.furiganaStyle,
                ...this._flattenWeights(settings.weights)
            });

            const response = await fetch(`${this.baseUrl}/api/test-display-text?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get display text:', error);
            throw error;
        }
    }

    /**
     * Check user answer
     */
    async checkAnswer(itemId, userAnswer, settings) {
        try {
            const formData = new FormData();
            formData.append('item_id', itemId);
            formData.append('user_answer', userAnswer);
            formData.append('display_mode', settings.displayMode);
            formData.append('kana_type', settings.kanaTypes.join(','));
            formData.append('furigana_style', settings.furiganaStyle);

            const response = await fetch(`${this.baseUrl}/api/check-answer`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to check answer:', error);
            throw error;
        }
    }

    /**
     * Get next flashcard item
     */
    async getNextItem() {
        try {
            const response = await fetch(`${this.baseUrl}/api/next-item`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get next item:', error);
            throw error;
        }
    }

    /**
     * Get flashcard statistics
     */
    async getStatistics() {
        try {
            const response = await fetch(`${this.baseUrl}/api/statistics`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get statistics:', error);
            throw error;
        }
    }

    /**
     * Flatten weights object for URL parameters
     */
    _flattenWeights(weights) {
        const flattened = {};
        Object.keys(weights).forEach(key => {
            flattened[`proportions.${key}`] = weights[key];
        });
        return flattened;
    }
}
