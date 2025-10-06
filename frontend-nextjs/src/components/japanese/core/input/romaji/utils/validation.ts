/**
 * Script validation utilities
 */

export type ScriptType = "romaji" | "hiragana" | "katakana" | "kanji" | "mixed";

/**
 * Check if text is romaji
 */
export function isRomaji(text: string): boolean {
  return /^[a-zA-Z0-9\s\-]*$/.test(text);
}

/**
 * Check if text is hiragana
 */
export function isHiragana(text: string): boolean {
  return /^[\u3040-\u309F\s]*$/.test(text);
}

/**
 * Check if text is katakana
 */
export function isKatakana(text: string): boolean {
  return /^[\u30A0-\u30FF\s]*$/.test(text);
}

/**
 * Detect script type of input text
 */
export function detectScript(text: string): ScriptType {
  const trimmed = text.trim();
  if (!trimmed) return "romaji";

  const hasRomaji = /[a-zA-Z]/.test(trimmed);
  const hasHiragana = /[\u3040-\u309F]/.test(trimmed);
  const hasKatakana = /[\u30A0-\u30FF]/.test(trimmed);
  const hasKanji = /[\u4E00-\u9FAF]/.test(trimmed);

  const scriptCount = [hasRomaji, hasHiragana, hasKatakana, hasKanji].filter(
    Boolean,
  ).length;

  if (scriptCount > 1) return "mixed";
  if (hasRomaji) return "romaji";
  if (hasHiragana) return "hiragana";
  if (hasKatakana) return "katakana";
  if (hasKanji) return "kanji";

  return "romaji";
}
