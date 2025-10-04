'use client';

import { useEffect, useState } from 'react';
import { FlashcardItem, UserSettings } from '@/lib/api-client';
import { ValidationResult } from '@/lib/validation';

interface FloatingFeedbackProps {
  item: FlashcardItem;
  userAnswer: string;
  isCorrect: boolean;
  matchedType?: string;
  convertedAnswer?: string;
  settings: UserSettings;
  frontendValidationResult?: ValidationResult | null;
  userAnswers?: Record<string, string>;
  moduleName?: string;
  timerDuration?: number;
  onClose: () => void;
}

export function FloatingFeedback({ 
  item, 
  userAnswer, 
  isCorrect, 
  matchedType, 
  convertedAnswer,
  settings,
  frontendValidationResult,
  userAnswers = {},
  moduleName,
  timerDuration = 8000,
  onClose
}: FloatingFeedbackProps) {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(timerDuration / 1000));

  // Auto-close timer
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, timerDuration);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [timerDuration, onClose]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // Add event listener with capture to ensure it's not blocked
    document.addEventListener('keydown', handleKeyPress, true);
    return () => document.removeEventListener('keydown', handleKeyPress, true);
  }, [onClose]);

  // Get enabled input modes
  const getEnabledModes = () => {
    const modes = [];
    if (settings.input_hiragana) modes.push('hiragana');
    if (settings.input_katakana) modes.push('katakana');
    if (settings.input_kanji) modes.push('kanji');
    if (settings.input_english) modes.push('english');
    if (settings.input_romaji) modes.push('romaji');
    return modes;
  };

  const enabledModes = getEnabledModes();
  const isMultipleInput = enabledModes.length > 1;
  

  // Get feedback color for the container background
  const getContainerFeedbackColor = () => {
    if (frontendValidationResult && frontendValidationResult.results && frontendValidationResult.results.length > 1) {
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
    } else if (frontendValidationResult && frontendValidationResult.isCorrect) {
      // Single input validation from hooks.ts - any correct answer is fully correct
      return "bg-emerald-500/20 border-emerald-400 text-emerald-300";
    } else if (frontendValidationResult) {
      // Single input mode - incorrect
      return "bg-red-500/20 border-red-400 text-red-300";
    }
    // Fallback to overall isCorrect
    return isCorrect 
      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
      : "bg-red-500/20 border-red-400 text-red-300";
  };

  // Get expected values for each input type
  const getExpectedValue = (mode: string) => {
    switch (mode) {
      case 'hiragana': return item.hiragana || '';
      case 'katakana': return item.katakana || '';
      case 'kanji': return item.kanji || '';
      case 'english': return item.english || '';
      case 'romaji': return item.hiragana || ''; // Romaji typically converts to hiragana
      default: return '';
    }
  };

  // Get user input for each mode
  const getUserInput = (mode: string) => {
    if (isMultipleInput && userAnswers[mode]) {
      return userAnswers[mode];
    }
    return userAnswer;
  };

  // Get status for each input type
  const getStatus = (mode: string) => {
    if (frontendValidationResult && frontendValidationResult.results && frontendValidationResult.results.length > 1) {
      // Multiple input mode - check individual results
      const modeIndex = enabledModes.indexOf(mode);
      return frontendValidationResult.results[modeIndex] || false;
    } else if (frontendValidationResult) {
      // Single input mode - use overall result
      return frontendValidationResult.isCorrect;
    }
    return isCorrect;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`max-w-2xl w-full p-6 rounded-lg border backdrop-blur-sm ${getContainerFeedbackColor()}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Answer Feedback</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">
              Auto-advancing in {timeLeft}s
            </span>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close feedback"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm text-white/80 mb-2">Quick Actions:</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm text-white transition-colors"
            >
              Press Enter to Continue
            </button>
            <span className="text-xs text-white/60 self-center">
              or wait {timeLeft} seconds
            </span>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-sm text-white/80 px-3 py-2 border-b border-white/20">
                  Input Type
                </th>
                <th className="text-left text-sm text-white/80 px-3 py-2 border-b border-white/20">
                  Your Answer
                </th>
                <th className="text-left text-sm text-white/80 px-3 py-2 border-b border-white/20">
                  Expected
                </th>
                <th className="text-center text-sm text-white/80 px-3 py-2 border-b border-white/20">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {(frontendValidationResult && frontendValidationResult.results && frontendValidationResult.results.length > 1 
                ? enabledModes 
                : matchedType ? [matchedType] : enabledModes
              ).map((mode) => {
                const userInput = getUserInput(mode);
                const expectedValue = getExpectedValue(mode);
                const isCorrectField = getStatus(mode);
                
                return (
                  <tr key={mode} className="border-b border-white/10">
                    <td className="px-3 py-2 text-white/90 capitalize text-sm">
                      {mode}
                    </td>
                    <td className="px-3 py-2 text-white text-sm font-medium">
                      {userInput || '-'}
                    </td>
                    <td className="px-3 py-2 text-white/80 text-sm">
                      {expectedValue || '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-lg ${isCorrectField ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isCorrectField ? '✅' : '❌'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Additional Info */}
        {matchedType && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Matched Type:</span>
              <span className="text-green-300 font-medium">{matchedType}</span>
            </div>
            {convertedAnswer && convertedAnswer !== userAnswer && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/70">Conversion Applied:</span>
                <span className="text-white/70">{convertedAnswer}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
