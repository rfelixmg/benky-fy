/**
 * API Client - Handles all backend communication
 * Manages API calls for display text, settings, and flashcard data
 */
export class ApiClient {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.baseUrl = `/begginer/${moduleName}`;
        this.maxItemId = null; // Cache the maximum item ID
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

            const response = await fetch(`${this.baseUrl}/api/display-text?${params}`);
            
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
    async checkAnswer(itemId, userAnswers, settings) {
        try {
            const formData = new FormData();
            formData.append('item_id', itemId);
            formData.append('input_modes', settings.inputModes.join(','));
            
            // Add user answers for each input mode
            Object.keys(userAnswers).forEach(mode => {
                const fieldName = `user_${mode}`;
                formData.append(fieldName, userAnswers[mode]);
            });

            const response = await fetch(`${this.baseUrl}/api/check-answers`, {
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
     * Get dataset information including size
     */
    async getDatasetInfo() {
        try {
            const response = await fetch(`${this.baseUrl}/api/dataset-info`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get dataset info:', error);
            throw error;
        }
    }

    /**
     * Get next flashcard item (simulated - no actual endpoint exists)
     * This will return a random item ID for the next flashcard
     */
    async getNextItem() {
        try {
            // Get the actual dataset size from the backend
            if (this.maxItemId === null) {
                const datasetInfo = await this.getDatasetInfo();
                this.maxItemId = datasetInfo.total_items;
            }
            
            const randomItemId = Math.floor(Math.random() * this.maxItemId) + 1;
            
            return {
                item_id: randomItemId,
                message: `Next item generated (random from 1-${this.maxItemId})`
            };
        } catch (error) {
            console.error('Failed to get next item:', error);
            throw error;
        }
    }

    /**
     * Get flashcard statistics (simulated - no actual endpoint exists)
     * This will return mock statistics
     */
    async getStatistics() {
        try {
            // Since there's no actual statistics endpoint, we'll return mock data
            return {
                total_items: 100,
                completed_items: 25,
                correct_answers: 20,
                incorrect_answers: 5,
                accuracy: 0.8,
                message: "Statistics simulated (no actual endpoint)"
            };
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
