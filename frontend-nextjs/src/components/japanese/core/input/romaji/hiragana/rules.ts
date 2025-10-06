import { ROMAJI_TO_HIRAGANA } from "../constants/hiragana-map";

export interface HiraganaRule {
  pattern: RegExp;
  replacement: string;
}

/**
 * Special rules for hiragana conversion
 */
export const HIRAGANA_RULES: HiraganaRule[] = [
  // Small tsu before ch
  { pattern: /っch/g, replacement: "っち" },
  
  // Small tsu before sh
  { pattern: /っsh/g, replacement: "っし" },
  
  // Small tsu before ts
  { pattern: /っts/g, replacement: "っつ" },
  
  // n before vowels
  { pattern: /n([aiueo])/g, replacement: "ん$1" },
  
  // n before y
  { pattern: /n(y[aiueo])/g, replacement: "ん$1" },
];

/**
 * Apply hiragana-specific rules to input
 */
export function applyHiraganaRules(input: string): string {
  let result = input;
  
  for (const rule of HIRAGANA_RULES) {
    result = result.replace(rule.pattern, rule.replacement);
  }
  
  return result;
}

/**
 * Convert romaji substring to hiragana
 */
export function convertToHiragana(input: string): string {
  let result = "";
  let i = 0;

  while (i < input.length) {
    let found = false;

    // Try longest matches first (up to 3 characters)
    for (let len = 3; len >= 1; len--) {
      const substr = input.substring(i, i + len);
      if (ROMAJI_TO_HIRAGANA[substr]) {
        result += ROMAJI_TO_HIRAGANA[substr];
        i += len;
        found = true;
        break;
      }
    }

    if (!found) {
      // Handle special cases
      if (input[i] === " ") {
        result += " ";
      } else if (input[i] === "-") {
        result += "ー";
      } else {
        result += input[i];
      }
      i++;
    }
  }

  return result;
}
