/**
 * Initialize the flashcard application
 * @param {string} moduleName - The name of the flashcard module
 */
export async function initializeFlashcardApp(moduleName) {
    try {
        // Dynamic imports to avoid top-level import issues
        const [
            { FlashcardComponent },
            { convertRomajiToHiragana, romajiToHiragana },
            { FuriganaRenderer },
            { ValidationUtils }
        ] = await Promise.all([
            import('/static/js/components/flashcard-component.js'),
            import('/static/js/utils/romaji-converter.js'),
            import('/static/js/utils/furigana-renderer.js'),
            import('/static/js/utils/validation.js')
        ]);

        // Create and initialize flashcard component
        const flashcardComponent = new FlashcardComponent(moduleName);
        await flashcardComponent.initialize();

        // Make it globally available
        window.flashcardApp = flashcardComponent;

        // Make utilities available globally for backward compatibility
        window.convertRomajiToHiragana = convertRomajiToHiragana;
        window.romajiToHiragana = romajiToHiragana;
        window.FuriganaRenderer = FuriganaRenderer;
        window.ValidationUtils = ValidationUtils;

        console.log('Flashcard application initialized successfully');
        return flashcardComponent;
    } catch (error) {
        console.error('Failed to initialize flashcard application:', error);
        throw error;
    }
}

/**
 * Get utility functions for backward compatibility
 */
export async function getUtilities() {
    const [
        { convertRomajiToHiragana, romajiToHiragana },
        { FuriganaRenderer },
        { ValidationUtils }
    ] = await Promise.all([
        import('/static/js/utils/romaji-converter.js'),
        import('/static/js/utils/furigana-renderer.js'),
        import('/static/js/utils/validation.js')
    ]);

    return {
        convertRomajiToHiragana,
        romajiToHiragana,
        FuriganaRenderer,
        ValidationUtils
    };
}