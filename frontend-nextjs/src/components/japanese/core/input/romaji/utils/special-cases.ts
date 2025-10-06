/**
 * Special character handling utilities
 */

export interface SpecialCaseOptions {
  outputType: "hiragana" | "katakana";
}

const DOUBLE_CONSONANTS = [
  "tt", "pp", "kk", "ss", "mm", "rr", "gg",
  "dd", "bb", "jj", "zz", "ff", "hh", "yy",
  "ww", "vv", "ll", "cc", "xx",
];

/**
 * Process double consonants (small tsu)
 */
export function processDoubleConsonants(input: string): string {
  let result = input.toLowerCase();
  
  for (const consonant of DOUBLE_CONSONANTS) {
    result = result.replace(
      new RegExp(consonant, "g"),
      "っ" + consonant[1],
    );
  }
  
  return result;
}

/**
 * Process long vowels for katakana
 */
export function processLongVowels(input: string): string {
  return input
    .replace(/([aiueo])\1/g, "$1ー") // Convert double vowels to vowel + dash
    .replace(/u-/g, "ū") // Special case for juusu -> jūsu
    .replace(/(\w)-/g, "$1ー"); // Convert remaining dashes to long vowel marker
}

/**
 * Process ja/ju/jo variations
 */
export function processJVariations(input: string): string {
  return input
    .replace(/j(y[auo])/g, "j$1") // Preserve jya/jyu/jyo
    .replace(/j([auo])/g, "j$1"); // Handle ja/ju/jo
}

/**
 * Normalize input for conversion
 */
export function normalizeInput(input: string, options: SpecialCaseOptions): string {
  let normalized = input.toLowerCase().trim();

  if (options.outputType === "katakana") {
    normalized = processJVariations(normalized);
    normalized = processLongVowels(normalized);
  }

  normalized = processDoubleConsonants(normalized);

  return normalized;
}

/**
 * Convert mixed input (romaji + other scripts)
 */
export function processMixedInput(
  input: string,
  converter: (text: string) => string,
): string {
  let result = "";
  let i = 0;

  while (i < input.length) {
    if (/[a-zA-Z]/.test(input[i])) {
      // Find the end of the romaji sequence
      let j = i;
      while (j < input.length && /[a-zA-Z]/.test(input[j])) {
        j++;
      }

      const romajiPart = input.substring(i, j);
      result += converter(romajiPart);
      i = j;
    } else {
      result += input[i];
      i++;
    }
  }

  return result;
}
