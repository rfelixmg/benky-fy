import { romajiToHiragana } from "../hiragana/conversion";
import { romajiToKatakana } from "../katakana/conversion";
import { detectScript } from "./validation";
import type { ConversionResult } from "../index";

/**
 * Smart input conversion based on field type and settings
 */
export function convertInputForField(
  input: string,
  fieldType: "hiragana" | "katakana" | "romaji",
  settings?: { romaji_output_type?: "hiragana" | "katakana" },
): ConversionResult {
  const scriptType = detectScript(input);

  // Handle pure romaji input
  if (scriptType === "romaji") {
    if (fieldType === "hiragana") {
      return romajiToHiragana(input);
    } else if (fieldType === "katakana") {
      return romajiToKatakana(input);
    } else if (fieldType === "romaji") {
      // Convert based on settings
      const outputType = settings?.romaji_output_type || "hiragana";
      return outputType === "katakana"
        ? romajiToKatakana(input)
        : romajiToHiragana(input);
    }
  }

  // No conversion needed
  return {
    original: input,
    converted: input,
    isValid: true,
  };
}
