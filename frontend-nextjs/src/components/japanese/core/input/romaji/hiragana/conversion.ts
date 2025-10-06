import { normalizeInput, processMixedInput } from "../utils/special-cases";
import { detectScript } from "../utils/validation";
import { applyHiraganaRules, convertToHiragana } from "./rules";

export interface ConversionResult {
  original: string;
  converted: string;
  isValid: boolean;
  errors?: string[];
}

/**
 * Convert romaji to hiragana with full processing
 */
export function romajiToHiragana(romaji: string): ConversionResult {
  const errors: string[] = [];
  
  // Normalize and preprocess input
  const normalized = normalizeInput(romaji, { outputType: "hiragana" });
  
  // Detect script type
  const scriptType = detectScript(normalized);
  
  let converted: string;
  
  if (scriptType === "mixed") {
    // Handle mixed input
    converted = processMixedInput(normalized, (part) => {
      const processed = applyHiraganaRules(part);
      return convertToHiragana(processed);
    });
  } else {
    // Process pure romaji input
    const processed = applyHiraganaRules(normalized);
    converted = convertToHiragana(processed);
  }
  
  // Validate result
  if (!/^[\u3040-\u309F\s\-ー]*$/.test(converted)) {
    const invalidChars = converted.match(/[^\u3040-\u309F\s\-ー]/g) || [];
    errors.push(`Invalid characters found: ${invalidChars.join(", ")}`);
  }
  
  return {
    original: romaji,
    converted,
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
