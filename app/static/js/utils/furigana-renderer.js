/**
 * Furigana Renderer - Handles furigana display logic
 * Manages different furigana display styles
 */
export class FuriganaRenderer {
    /**
     * Render furigana text based on style
     * @param {string} kanji - The kanji text
     * @param {string} furigana - The furigana text
     * @param {string} style - The display style ('ruby', 'brackets', 'hover', 'inline')
     * @returns {string} - The rendered HTML
     */
    static render(kanji, furigana, style = 'ruby') {
        if (!kanji || !furigana) return kanji || '';

        switch (style) {
            case 'ruby':
                return `<ruby>${kanji}<rt>${furigana}</rt></ruby>`;
            
            case 'brackets':
                return `${kanji}[${furigana}]`;
            
            case 'hover':
                return `<span class="furigana-hover" title="${furigana}">${kanji}</span>`;
            
            case 'inline':
                return `${kanji} (${furigana})`;
            
            default:
                return kanji;
        }
    }

    /**
     * Parse furigana HTML and extract kanji and furigana
     * @param {string} furiganaHtml - The furigana HTML string
     * @returns {Object} - Object with kanji and furigana properties
     */
    static parse(furiganaHtml) {
        if (!furiganaHtml) return { kanji: '', furigana: '' };

        // Try to parse ruby tags
        const rubyMatch = furiganaHtml.match(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/);
        if (rubyMatch) {
            return {
                kanji: rubyMatch[1],
                furigana: rubyMatch[2]
            };
        }

        // Try to parse bracket format
        const bracketMatch = furiganaHtml.match(/^(.*?)\[(.*?)\]$/);
        if (bracketMatch) {
            return {
                kanji: bracketMatch[1],
                furigana: bracketMatch[2]
            };
        }

        // Try to parse inline format
        const inlineMatch = furiganaHtml.match(/^(.*?)\s*\((.*?)\)$/);
        if (inlineMatch) {
            return {
                kanji: inlineMatch[1],
                furigana: inlineMatch[2]
            };
        }

        // If no pattern matches, return as kanji
        return {
            kanji: furiganaHtml,
            furigana: ''
        };
    }

    /**
     * Convert between different furigana styles
     * @param {string} text - The text to convert
     * @param {string} fromStyle - The current style
     * @param {string} toStyle - The target style
     * @returns {string} - The converted text
     */
    static convertStyle(text, fromStyle, toStyle) {
        if (fromStyle === toStyle) return text;

        const parsed = this.parse(text);
        return this.render(parsed.kanji, parsed.furigana, toStyle);
    }
}
