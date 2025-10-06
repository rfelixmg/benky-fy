import { normalizeInput, processMixedInput } from "../utils/special-cases";
import { detectScript } from "../utils/validation";
import { applyKatakanaRules, convertToKatakana } from "./rules";

export interface ConversionResult {
  original: string;
  converted: string;
  isValid: boolean;
  errors?: string[];
}

/**
 * Convert romaji to katakana with full processing
 */
export function romajiToKatakana(romaji: string): ConversionResult {
  const errors: string[] = [];
  
  // Normalize and preprocess input
  const normalized = normalizeInput(romaji, { outputType: "katakana" });
  
  // Detect script type
  const scriptType = detectScript(normalized);
  
  let converted: string;
  
  if (scriptType === "mixed") {
    // Handle mixed input
    converted = processMixedInput(normalized, (part) => {
      const processed = applyKatakanaRules(part);
      return convertToKatakana(processed);
    });
  } else {
    // Process pure romaji input
    const processed = applyKatakanaRules(normalized);
    converted = convertToKatakana(processed);
  }
  
  // Validate result
  if (!/^[\u30A0-\u30FF\s\-ー]*$/.test(converted)) {
    const invalidChars = converted.match(/[^\u30A0-\u30FF\s\-ー]/g) || [];
    errors.push(`Invalid characters found: ${invalidChars.join(", ")}`);
  }
  
  return {
    original: romaji,
    converted,
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
