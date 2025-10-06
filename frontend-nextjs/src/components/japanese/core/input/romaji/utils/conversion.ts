import { romajiToHiragana } from "../hiragana/conversion";
import { romajiToKatakana } from "../katakana/conversion";
import type { ConversionOptions, ConversionResult } from "../types";

/**
 * Convert romaji to kana with options
 */
export function romajiToKana(
  romaji: string,
  options: ConversionOptions,
): ConversionResult {
  if (options.outputType === "katakana") {
    return romajiToKatakana(romaji);
  } else {
    return romajiToHiragana(romaji);
  }
}