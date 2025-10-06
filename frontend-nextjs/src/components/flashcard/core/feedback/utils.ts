import { FlashcardItem, UserSettings } from "@/core/api-client";
import { ValidationResult } from "@/core/validation";
import { getModuleType } from "../input/helpers/module-type";

export const getEnabledInputModes = (settings: UserSettings, moduleName?: string) => {
  const moduleType = getModuleType(moduleName);
  const modes = [];

  if (settings.input_hiragana) modes.push("hiragana");
  if (settings.input_katakana && moduleType.hasKatakana) modes.push("katakana");
  if (settings.input_kanji && moduleType.hasKanji) modes.push("kanji");
  if (settings.input_english) modes.push("english");
  if (settings.input_romaji) modes.push("romaji");

  return modes;
};

export const getExpectedValue = (mode: string, item: FlashcardItem): string => {
  switch (mode) {
    case "hiragana":
      return item.hiragana || "";
    case "katakana":
      return item.katakana || "";
    case "kanji":
      return item.kanji || "";
    case "english":
      return item.english || "";
    case "romaji":
      return item.hiragana || ""; // Romaji typically converts to hiragana
    default:
      return "";
  }
};

export const getUserInput = (
  mode: string,
  userAnswer: string,
  userAnswers: Record<string, string>,
  isMultipleInput: boolean
): string => {
  if (isMultipleInput && userAnswers[mode]) {
    return userAnswers[mode];
  }
  return userAnswer;
};

export const getStatus = (
  mode: string,
  enabledModes: string[],
  frontendValidationResult?: ValidationResult | null,
  isCorrect: boolean = false
): boolean => {
  if (
    frontendValidationResult?.results &&
    frontendValidationResult.results.length > 1
  ) {
    // Multiple input mode - check individual results
    const modeIndex = enabledModes.indexOf(mode);
    return frontendValidationResult.results[modeIndex] || false;
  } else if (frontendValidationResult) {
    // Single input mode - use overall result
    return frontendValidationResult.isCorrect;
  }
  return isCorrect;
};

export const getFeedbackContainerColor = (
  frontendValidationResult?: ValidationResult | null,
  isCorrect: boolean = false
): string => {
  if (
    frontendValidationResult?.results &&
    frontendValidationResult.results.length > 1
  ) {
    // Multiple input mode - use results array
    const correctCount = frontendValidationResult.results.filter(Boolean).length;
    const totalCount = frontendValidationResult.results.length;

    if (correctCount === totalCount) {
      return "bg-emerald-500/20 border-emerald-400 text-emerald-300";
    } else if (correctCount > 0) {
      return "bg-amber-500/20 border-amber-400 text-amber-300";
    } else {
      return "bg-red-500/20 border-red-400 text-red-300";
    }
  } else if (frontendValidationResult?.isCorrect) {
    return "bg-emerald-500/20 border-emerald-400 text-emerald-300";
  } else if (frontendValidationResult) {
    return "bg-red-500/20 border-red-400 text-red-300";
  }
  
  return isCorrect
    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
    : "bg-red-500/20 border-red-400 text-red-300";
};
