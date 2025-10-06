"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UserSettings } from "@/core/api-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils";
import {
  detectScript,
  romajiToHiragana,
  romajiToKatakana,
  convertInputForField,
} from "@/core/romaji-conversion";
import { AnswerFeedback } from "./answer-feedback";
import { FlashcardItem } from "@/core/api-client";
import { useValidateInput } from "@/core/hooks";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  validateAnswer,
  ValidationResult,
  getFeedbackColor,
  validateWithSettings,
} from "@/core/validation";

interface AnswerInputProps {
  onSubmit: (
    answer:
      | string
      | {
          english: string;
          hiragana: string;
          katakana?: string;
          kanji?: string;
          romaji?: string;
        },
    validationResult?: any,
  ) => void;
  onAdvance?: () => void;
  disabled: boolean;
  settings: UserSettings;
  isCorrect?: boolean;
  currentItem?: FlashcardItem;
  lastAnswer?: string;
  lastMatchedType?: string;
  lastConvertedAnswer?: string;
  moduleName?: string;
  enableServerValidation?: boolean;
  enableRealtimeFeedback?: boolean;
}

// Module type detection for context-aware input fields
const getModuleType = (moduleName?: string) => {
  if (!moduleName)
    return {
      hasKatakana: false,
      hasKanji: false,
      hasFurigana: false,
      isConjugationModule: false,
    };

  const moduleTypeMap: Record<
    string,
    {
      hasKatakana: boolean;
      hasKanji: boolean;
      hasFurigana: boolean;
      isConjugationModule: boolean;
    }
  > = {
    hiragana: {
      hasKatakana: false,
      hasKanji: false,
      hasFurigana: false,
      isConjugationModule: false,
    },
    katakana: {
      hasKatakana: true,
      hasKanji: false,
      hasFurigana: false,
      isConjugationModule: false,
    },
    katakana_words: {
      hasKatakana: true,
      hasKanji: false,
      hasFurigana: false,
      isConjugationModule: false,
    },
    verbs: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: true,
    },
    adjectives: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: true,
    },
    base_nouns: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    colors_basic: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    days_of_week: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    greetings_essential: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    months_complete: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    numbers_basic: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    numbers_extended: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    question_words: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    vocab: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
  };

  return (
    moduleTypeMap[moduleName] || {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    }
  );
};

export function AnswerInput({
  onSubmit,
  onAdvance,
  disabled,
  settings,
  isCorrect = false,
  currentItem,
  lastAnswer,
  lastMatchedType,
  lastConvertedAnswer,
  moduleName,
  enableServerValidation = true,
  enableRealtimeFeedback = true,
}: AnswerInputProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [frontendValidationResult, setFrontendValidationResult] =
    useState<ValidationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimer, setFeedbackTimer] = useState(0);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validateInputMutation = useValidateInput();

  useEffect(() => {
    if (!disabled) {
      const enabledModes = getEnabledInputModes();
      const firstInputRef = inputRefs.current[enabledModes[0]];
      if (firstInputRef) {
        firstInputRef.focus();
      }
    }
  }, [disabled]);

  // Reset feedback state when currentItem changes (navigation to new word)
  useEffect(() => {
    setShowFeedback(false);
    setValidationResult(null);
    setFrontendValidationResult(null);
    setAnswers({});
    setIsSubmitting(false);
    setFeedbackTimer(0);
    if (feedbackTimerRef.current) {
      clearInterval(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [currentItem?.id]);

  // 10-second feedback timer
  useEffect(() => {
    if (showFeedback && enableRealtimeFeedback) {
      setFeedbackTimer(10);

      feedbackTimerRef.current = setInterval(() => {
        setFeedbackTimer((prev) => {
          if (prev <= 1) {
            // Timer finished - auto advance
            onSubmit("", validationResult || frontendValidationResult);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (feedbackTimerRef.current) {
        clearInterval(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      setFeedbackTimer(0);
    }

    return () => {
      if (feedbackTimerRef.current) {
        clearInterval(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [
    showFeedback,
    enableRealtimeFeedback,
    onSubmit,
    validationResult,
    frontendValidationResult,
  ]);

  // Enter key listener for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showFeedback && onAdvance) {
        e.preventDefault();
        onAdvance();
      }
    };

    if (showFeedback) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFeedback, onAdvance]);

  // Server-side validation function
  const validateWithServer = useCallback(
    async (userInput: string, expectedCharacter: string) => {
      if (!enableServerValidation || !currentItem) return null;

      try {
        const validationRequest = {
          character: expectedCharacter,
          input: userInput,
          type: "hiragana" as const,
          moduleName: moduleName || "unknown",
        };

        const result =
          await validateInputMutation.mutateAsync(validationRequest);
        return result;
      } catch (error) {
        console.error("Server validation failed:", error);
        return null;
      }
    },
    [enableServerValidation, currentItem, validateInputMutation],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const enabledModes = getEnabledInputModes();
    const isMultipleInput = enabledModes.length > 1;

    // Check if we have valid input(s)
    const hasValidInput = enabledModes.some((mode) => answers[mode]?.trim());
    if (!hasValidInput || disabled || isSubmitting) return;

    setIsSubmitting(true);
    setShowFeedback(false);
    setValidationResult(null);
    setFrontendValidationResult(null);

    try {
      let serverValidationResult = null;
      let frontendResult: ValidationResult | null = null;

      // Perform frontend validation first
      if (currentItem) {
        if (isMultipleInput) {
          // Multiple input mode - use comprehensive validation
          frontendResult = validateWithSettings(
            answers,
            currentItem,
            enabledModes,
          );
        } else {
          // Single input mode
          const firstAnswer = answers[enabledModes[0]] || "";
          frontendResult = validateAnswer(firstAnswer, currentItem, settings);
        }

        setFrontendValidationResult(frontendResult);
      }

      // Perform server-side validation if enabled
      if (enableServerValidation && currentItem) {
        const firstAnswer = answers[enabledModes[0]] || "";
        const expectedCharacter = (
          currentItem.hiragana ||
          currentItem.kanji ||
          currentItem.english ||
          ""
        ).toString();
        serverValidationResult = await validateWithServer(
          firstAnswer.trim(),
          expectedCharacter,
        );
        if (serverValidationResult) {
          setValidationResult(serverValidationResult);
        }
      }

      // Show feedback if enabled
      if (enableRealtimeFeedback) {
        setShowFeedback(true);
      }

      // Submit with validation results
      const firstAnswer = answers[enabledModes[0]] || "";

      // For multiple input mode, pass all answers as an object
      if (isMultipleInput) {
        const allAnswers = {
          english: answers.english || "",
          hiragana: answers.hiragana || "",
          katakana: answers.katakana || "",
          kanji: answers.kanji || "",
          romaji: answers.romaji || "",
        };
        await onSubmit(allAnswers, serverValidationResult || frontendResult);
      } else {
        await onSubmit(
          firstAnswer.trim(),
          serverValidationResult || frontendResult,
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);

      // Refocus input after submission
      setTimeout(() => {
        const firstInputRef = inputRefs.current[enabledModes[0]];
        if (firstInputRef) {
          firstInputRef.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showFeedback) {
      handleSubmit(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showFeedback) {
      handleSubmit(e);
    }
  };

  const handleInputChange =
    (mode: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Use smart conversion for hiragana, katakana, and romaji fields
      if (["hiragana", "katakana", "romaji"].includes(mode)) {
        const conversion = convertInputForField(inputValue, mode as any, {
          romaji_output_type: settings.romaji_output_type as
            | "hiragana"
            | "katakana",
        });
        setAnswers((prev) => ({ ...prev, [mode]: conversion.converted }));
        return;
      }

      // For other field types (kanji, english), no conversion needed
      setAnswers((prev) => ({ ...prev, [mode]: inputValue }));
    };

  const getEnabledInputModes = () => {
    const moduleType = getModuleType(moduleName);
    const modes = [];

    if (settings.input_hiragana) modes.push("hiragana");
    if (settings.input_katakana && moduleType.hasKatakana)
      modes.push("katakana");
    if (settings.input_kanji && moduleType.hasKanji) modes.push("kanji");
    if (settings.input_english) modes.push("english");
    if (settings.input_romaji) modes.push("romaji");

    return modes;
  };

  const renderInput = () => {
    const enabledModes = getEnabledInputModes();
    const isMultipleInput = enabledModes.length > 1;

    // Get feedback color for multiple input mode
    const getInputFeedbackColor = (mode: string) => {
      if (!frontendValidationResult || !showFeedback) return "";

      if (
        isMultipleInput &&
        enabledModes.includes("english") &&
        enabledModes.includes("hiragana")
      ) {
        // For multiple input mode, apply color based on individual field results
        if (mode === "english" && frontendValidationResult.results) {
          const englishCorrect = frontendValidationResult.results[0];
          return englishCorrect
            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
            : "bg-red-500/20 border-red-400 text-red-300";
        } else if (mode === "hiragana" && frontendValidationResult.results) {
          const hiraganaCorrect = frontendValidationResult.results[1];
          return hiraganaCorrect
            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
            : "bg-red-500/20 border-red-400 text-red-300";
        }
      }

      // For single input mode, use the overall feedback color
      return frontendValidationResult.feedbackColor;
    };

    // If multiple input modes are enabled, show table format like V1
    if (isMultipleInput) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-sm text-white/80 px-4 py-2 border-b border-white/20">
                  Input Type
                </th>
                <th className="text-left text-sm text-white/80 px-4 py-2 border-b border-white/20">
                  Your Answer
                </th>
              </tr>
            </thead>
            <tbody>
              {enabledModes.map((mode) => (
                <tr key={mode} className="border-b border-white/10">
                  <td className="px-4 py-3 text-white/90 capitalize">{mode}</td>
                  <td className="px-4 py-3">
                    <input
                      ref={(el) => {
                        inputRefs.current[mode] = el;
                      }}
                      type="text"
                      value={answers[mode] || ""}
                      onChange={handleInputChange(mode)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Enter ${mode} answer...`}
                      disabled={disabled}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-transparent disabled:opacity-50",
                        isSubmitting && "opacity-50",
                        getInputFeedbackColor(mode),
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Single input field for single mode or no specific modes
    const singleMode = enabledModes[0] || "answer";
    return (
      <input
        ref={(el) => {
          inputRefs.current[singleMode] = el;
        }}
        type="text"
        value={answers[singleMode] || ""}
        onChange={handleInputChange(singleMode)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your answer..."
        disabled={disabled}
        className={cn(
          "w-full px-6 py-4 text-lg rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50",
          isSubmitting && "opacity-50",
          getInputFeedbackColor(singleMode),
        )}
      />
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          {renderInput()}

          {isSubmitting && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={
              !Object.values(answers).some((answer) => answer.trim()) ||
              disabled ||
              isSubmitting
            }
            className="bg-white text-primary hover:bg-white/90 px-8 py-2"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </div>
            ) : (
              "Submit Answer"
            )}
          </Button>
        </div>
      </form>

      {/* Real-time feedback */}
      {showFeedback &&
        (validationResult || frontendValidationResult) &&
        enableRealtimeFeedback &&
        currentItem && (
          <AnswerFeedback
            item={currentItem}
            userAnswer={answers[getEnabledInputModes()[0]] || ""}
            isCorrect={
              validationResult?.is_correct ||
              frontendValidationResult?.isCorrect ||
              false
            }
            matchedType={frontendValidationResult?.matchedType}
            convertedAnswer={frontendValidationResult?.convertedAnswer}
            settings={settings}
            frontendValidationResult={frontendValidationResult}
            userAnswers={Object.fromEntries(
              getEnabledInputModes().map((mode) => [mode, answers[mode] || ""]),
            )}
            moduleName={moduleName}
          />
        )}

      {/* Feedback timer display */}
      {showFeedback && feedbackTimer > 0 && (
        <div className="text-center text-white/80 text-sm mt-4">
          <p>Auto-advancing in {feedbackTimer} seconds</p>
          <p className="text-white/60 mt-1">Press Enter to advance now</p>
        </div>
      )}

      {/* Input hints */}
      {!showFeedback && (
        <div className="text-center text-white/60 text-sm mt-4">
          <p>Press Enter to submit your answer</p>
          <p className="mt-1">
            Hiragana/Katakana fields auto-convert romaji input
          </p>
          {enableServerValidation && (
            <p className="mt-1">Server-side validation enabled</p>
          )}
        </div>
      )}
    </div>
  );
}
