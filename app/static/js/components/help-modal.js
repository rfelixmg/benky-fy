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

        // Use provided item data or fetch from API
        if (itemData) {
            this.currentItem = itemData;
            this._populateModal();
        } else if (this.moduleName && itemId) {
            // Fetch word info from API
            await this._fetchWordInfo(itemId);
        } else {
            // Fallback: get current item from display manager
            this.currentItem = this._getCurrentItemData();
            if (!this.currentItem) {
                console.warn('No item data available for help modal');
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
     * Fetch word information from API
     */
    async _fetchWordInfo(itemId) {
        try {
            const response = await fetch(`/help/api/word-info?module_name=${this.moduleName}&item_id=${itemId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.currentItem = data.word_info;
                this._populateModalFromAPI(data.display_info);
            } else {
                console.error('Failed to fetch word info:', data.error);
                this._showError('Failed to load word information');
            }
        } catch (error) {
            console.error('Error fetching word info:', error);
            this._showError('Error loading word information');
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
     * Show error message in modal
     */
    _showError(message) {
        const modalBody = document.getElementById('helpModalBody');
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div class="help-error">
                <p>❌ ${message}</p>
            </div>
        `;
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
