// Export types
export type { ConversionOptions, ConversionResult } from "./types";

// Export conversion functions
export { romajiToHiragana } from "./hiragana/conversion";
export { romajiToKatakana } from "./katakana/conversion";
export { romajiToKana } from "./utils/conversion";

// Export utilities
export { detectScript } from "./utils/validation";
export type { ScriptType } from "./utils/validation";
export { convertInputForField } from "./utils/field-conversion";

// Export hooks
export { useRomajiConversion } from "./hooks/use-romaji-conversion";

// Re-export components
export { RomajiInput } from "./hiragana/hiragana-input";
export { RomajiInputWithOptions } from "./katakana/katakana-input";