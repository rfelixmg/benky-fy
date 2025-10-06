import {
  romajiToHiragana,
  romajiToKatakana,
  detectScript,
} from "@/core/romaji-conversion";

export interface ConversionResult {
  converted: string;
  isValid: boolean;
  isConverting: boolean;
  error?: string;
}

export function useRomajiConversion(
  value: string,
  type: "hiragana" | "katakana" | "auto",
  debounceMs: number = 150
): ConversionResult {
  let timeoutId: NodeJS.Timeout;

  const convert = (): ConversionResult => {
    if (!value.trim()) {
      return { converted: "", isValid: true, isConverting: false };
    }

    try {
      let converted = "";

      if (type === "katakana") {
        converted = romajiToKatakana(value).converted;
      } else if (type === "hiragana") {
        converted = romajiToHiragana(value).converted;
      } else {
        // Auto-detect based on input
        const scriptType = detectScript(value);
        if (scriptType === "romaji") {
          converted = romajiToHiragana(value).converted;
        } else {
          converted = value;
        }
      }

      return {
        converted,
        isValid: true,
        isConverting: false,
      };
    } catch (error) {
      return {
        converted: "",
        isValid: false,
        isConverting: false,
        error: error instanceof Error ? error.message : "Conversion error",
      };
    }
  };

  const debouncedConvert = (): Promise<ConversionResult> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        resolve(convert());
      }, debounceMs);
    });
  };

  return {
    converted: "",
    isValid: true,
    isConverting: true,
    debouncedConvert,
  } as ConversionResult;
}
