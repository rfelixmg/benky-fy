/**
 * Help Component - Modular word information system
 * Handles word information display and API communication
 */
export class HelpComponent {
    constructor() {
        this.modal = null;
        this.currentItem = null;
        this.moduleName = null;
        this.currentItemId = null;
        this.apiClient = null;
        this.isLoading = false;
        this.hasError = false;
        this.errorMessage = '';
        this.cache = new Map(); // Cache for successful responses
        this.timeoutMs = 10000; // 10 second timeout
    }

    /**
     * Initialize the help component
     */
    initialize(moduleName = null, apiClient = null) {
        this.moduleName = moduleName;
        this.apiClient = apiClient;
        
        this.modal = document.getElementById('helpModal');
        if (!this.modal) {
            console.warn('Help modal not found');
            return;
        }

        this._setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        // Help button
        const helpButton = document.getElementById('helpButton');
        if (helpButton) {
            helpButton.addEventListener('click', () => {
                this.show();
            });
        }

        // Close button
        const closeButton = document.getElementById('helpCloseBtn');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hide();
            });
        }

        // Close on backdrop click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hide();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
                this.hide();
            }
        });
    }

    /**
     * Show the help modal with current item data
     */
    async show(itemData = null, itemId = null) {
        if (!this.modal) return;

        // Reset error state
        this.hasError = false;
        this.errorMessage = '';

        // Use provided item data or fetch from API
        if (itemData) {
            this.currentItem = itemData;
            this._populateModal();
        } else if (this.moduleName && itemId) {
            // Check cache first
            const cacheKey = `${this.moduleName}-${itemId}`;
            if (this.cache.has(cacheKey)) {
                this.currentItem = this.cache.get(cacheKey);
                this._populateModal();
            } else {
                // Fetch word info from API with loading state
                await this._fetchWordInfo(itemId);
            }
        } else {
            // Fallback: get current item from display manager
            this.currentItem = this._getCurrentItemData();
            if (!this.currentItem) {
                this._showError('No word information available');
                return;
            }
            this._populateModal();
        }

        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    /**
     * Hide the help modal
     */
    hide() {
        if (!this.modal) return;

        this.modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Fetch word information from API with loading states and error handling
     */
    async _fetchWordInfo(itemId) {
        this.isLoading = true;
        this._showLoadingState();

        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), this.timeoutMs);
            });

            // Create fetch promise
            const fetchPromise = fetch(`/help/api/word-info?module_name=${this.moduleName}&item_id=${itemId}`);
            
            // Race between fetch and timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.currentItem = data.word_info;
                
                // Cache successful response
                const cacheKey = `${this.moduleName}-${itemId}`;
                this.cache.set(cacheKey, data.word_info);
                
                this._populateModalFromAPI(data.display_info);
            } else {
                throw new Error(data.error || 'Failed to load word information');
            }
        } catch (error) {
            console.error('Error fetching word info:', error);
            
            if (error.message === 'Request timeout') {
                this._showError('Request timed out. Please check your connection and try again.', true);
            } else if (error.message.includes('HTTP error')) {
                this._showError('Server error. Please try again later.', true);
            } else {
                this._showError('Failed to load word information. Please try again.', true);
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get current item data from display manager or flashcard component
     */
    _getCurrentItemData() {
        // Try to get data from display manager first
        if (window.flashcardApp && window.flashcardApp.displayManager) {
            const currentItem = window.flashcardApp.displayManager.getCurrentItem();
            if (currentItem) {
                return currentItem;
            }
        }

        // Fallback: try to get from global flashcard app
        if (window.flashcardApp && window.flashcardApp.currentItem) {
            return window.flashcardApp.currentItem;
        }

        return null;
    }

    /**
     * Populate the modal with word information
     */
    _populateModal() {
        const modalBody = document.getElementById('helpModalBody');
        if (!modalBody || !this.currentItem) return;

        // Extract word information
        const kanji = this.currentItem.kanji || '';
        const hiragana = this.currentItem.hiragana || '';
        const english = this.currentItem.english || '';
        
        // Extract furigana from furigana_html if available
        let furigana = '';
        if (this.currentItem.furigana_html) {
            // Extract furigana from ruby tags
            const furiganaMatch = this.currentItem.furigana_html.match(/<rt>(.*?)<\/rt>/g);
            if (furiganaMatch) {
                furigana = furiganaMatch.map(match => match.replace(/<\/?rt>/g, '')).join('');
            }
        }

        // Build the HTML content
        const content = `
            <div class="help-word-info">
                ${kanji ? `
                    <div class="help-info-item">
                        <div class="help-info-label">Kanji</div>
                        <div class="help-info-value kanji">${kanji}</div>
                    </div>
                ` : ''}
                
                ${furigana ? `
                    <div class="help-info-item">
                        <div class="help-info-label">Furigana</div>
                        <div class="help-info-value furigana">${furigana}</div>
                    </div>
                ` : ''}
                
                ${hiragana && !furigana ? `
                    <div class="help-info-item">
                        <div class="help-info-label">Hiragana</div>
                        <div class="help-info-value">${hiragana}</div>
                    </div>
                ` : ''}
                
                ${english ? `
                    <div class="help-info-item">
                        <div class="help-info-label">English</div>
                        <div class="help-info-value">${english}</div>
                    </div>
                ` : ''}
            </div>
        `;

        modalBody.innerHTML = content;
    }

    /**
     * Populate modal from API data
     */
    _populateModalFromAPI(displayInfo) {
        const modalBody = document.getElementById('helpModalBody');
        if (!modalBody || !displayInfo) return;

        // Build HTML from structured display info
        let content = '<div class="help-word-info">';
        
        Object.keys(displayInfo).forEach(key => {
            const info = displayInfo[key];
            if (info.visible && info.value) {
                content += `
                    <div class="help-info-item">
                        <div class="help-info-label">${info.label}</div>
                        <div class="help-info-value ${info.class}">${info.value}</div>
                    </div>
                `;
            }
        });
        
        content += '</div>';
        modalBody.innerHTML = content;
    }

    /**
     * Show loading state in modal
     */
    _showLoadingState() {
        const modalBody = document.getElementById('helpModalBody');
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div class="help-loading">
                <div class="loading-spinner"></div>
                <p>Loading word information...</p>
            </div>
        `;
    }

    /**
     * Show error message in modal with retry option
     */
    _showError(message, showRetry = false) {
        const modalBody = document.getElementById('helpModalBody');
        if (!modalBody) return;

        this.hasError = true;
        this.errorMessage = message;

        const retryButton = showRetry ? `
            <button type="button" class="retry-button" id="retryHelpBtn">
                Try Again
            </button>
        ` : '';

        modalBody.innerHTML = `
            <div class="help-error">
                <p>❌ ${message}</p>
                ${retryButton}
            </div>
        `;

        // Add retry button event listener if present
        if (showRetry) {
            const retryBtn = document.getElementById('retryHelpBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this._retryRequest();
                });
            }
        }
    }

    /**
     * Retry the failed request
     */
    async _retryRequest() {
        if (this.currentItemId) {
            await this._fetchWordInfo(this.currentItemId);
        }
    }

    /**
     * Update the modal with new item data
     */
    updateItem(itemData) {
        this.currentItem = itemData;
        if (this.modal && this.modal.style.display !== 'none') {
            this._populateModal();
        }
    }
}
