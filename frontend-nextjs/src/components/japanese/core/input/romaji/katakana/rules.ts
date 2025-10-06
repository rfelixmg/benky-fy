import { HIRAGANA_TO_KATAKANA } from "../constants/katakana-map";
import { SPECIAL_KATAKANA } from "../constants/katakana-map";
import { convertToHiragana } from "../hiragana/rules";

export interface KatakanaRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
}

/**
 * Special rules for katakana conversion
 */
export const KATAKANA_RULES: KatakanaRule[] = [
  // Long vowel marker after a
  { pattern: /a-/g, replacement: "アー" },
  { pattern: /i-/g, replacement: "イー" },
  { pattern: /u-/g, replacement: "ウー" },
  { pattern: /e-/g, replacement: "エー" },
  { pattern: /o-/g, replacement: "オー" },
  
  // Special katakana combinations
  { pattern: /tch/g, replacement: "ッチ" },
  { pattern: /cch/g, replacement: "ッチ" },
  
  // Foreign word patterns
  { pattern: /f([aiueo])/g, replacement: (_, vowel) => SPECIAL_KATAKANA[`f${vowel}`] || "" },
  { pattern: /v([aiueo])/g, replacement: (_, vowel) => SPECIAL_KATAKANA[`v${vowel}`] || "" },
  { pattern: /w([ieo])/g, replacement: (_, vowel) => SPECIAL_KATAKANA[`w${vowel}`] || "" },
];

/**
 * Apply katakana-specific rules to input
 */
export function applyKatakanaRules(input: string): string {
  let result = input;
  
  // Apply special katakana patterns first
  for (const pattern of Object.keys(SPECIAL_KATAKANA)) {
    const regex = new RegExp(pattern, "g");
    result = result.replace(regex, SPECIAL_KATAKANA[pattern]);
  }
  
  // Then apply general rules
  for (const rule of KATAKANA_RULES) {
    result = result.replace(rule.pattern, rule.replacement as string);
  }
  
  return result;
}

/**
 * Convert hiragana to katakana
 */
export function convertHiraganaToKatakana(hiragana: string): string {
  let result = "";
  
  for (let i = 0; i < hiragana.length; i++) {
    const char = hiragana[i];
    result += HIRAGANA_TO_KATAKANA[char] || char;
  }
  
  return result;
}

/**
 * Convert romaji substring to katakana
 */
export function convertToKatakana(input: string): string {
  // First convert to hiragana
  const hiragana = convertToHiragana(input);
  
  // Then convert hiragana to katakana
  return convertHiraganaToKatakana(hiragana);
}