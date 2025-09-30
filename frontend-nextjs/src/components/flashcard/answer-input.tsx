'use client';

import { useState, useRef, useEffect } from 'react';
import { UserSettings } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { detectScript, romajiToHiragana, romajiToKatakana } from '@/lib/romaji-conversion';
import { AnswerFeedback } from './answer-feedback';
import { FlashcardItem } from '@/lib/api-client';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled: boolean;
  settings: UserSettings;
  currentAttempts?: number;
  maxAttempts?: number;
  isCorrect?: boolean;
  currentItem?: FlashcardItem;
  lastAnswer?: string;
  lastMatchedType?: string;
  lastConvertedAnswer?: string;
}

export function AnswerInput({ 
  onSubmit, 
  disabled, 
  settings, 
  currentAttempts = 0, 
  maxAttempts = 3, 
  isCorrect = false,
  currentItem,
  lastAnswer,
  lastMatchedType,
  lastConvertedAnswer
}: AnswerInputProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!disabled) {
      const enabledModes = getEnabledInputModes();
      const firstInputRef = inputRefs.current[enabledModes[0]];
      if (firstInputRef) {
        firstInputRef.focus();
      }
    }
  }, [disabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const enabledModes = getEnabledInputModes();
    const firstAnswer = answers[enabledModes[0]] || '';
    
    if (!firstAnswer.trim() || disabled || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Submit the first non-empty answer
    await onSubmit(firstAnswer.trim());
    setAnswers({});
    setIsSubmitting(false);
    
    // Refocus input after submission
    setTimeout(() => {
      const firstInputRef = inputRefs.current[enabledModes[0]];
      if (firstInputRef) {
        firstInputRef.focus();
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleInputChange = (mode: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // If this is a hiragana field, always convert romaji to hiragana
    if (mode === 'hiragana') {
      const scriptType = detectScript(inputValue);
      if (scriptType === 'romaji') {
        const conversion = romajiToHiragana(inputValue);
        setAnswers(prev => ({ ...prev, [mode]: conversion.converted }));
        return;
      } else if (scriptType === 'mixed') {
        // For mixed input, extract and convert only the romaji parts
        let result = '';
        let i = 0;
        while (i < inputValue.length) {
          if (/[a-zA-Z]/.test(inputValue[i])) {
            // Find the end of the romaji sequence
            let j = i;
            while (j < inputValue.length && /[a-zA-Z]/.test(inputValue[j])) {
              j++;
            }
            const romajiPart = inputValue.substring(i, j);
            const conversion = romajiToHiragana(romajiPart);
            result += conversion.converted;
            i = j;
          } else {
            result += inputValue[i];
            i++;
          }
        }
        setAnswers(prev => ({ ...prev, [mode]: result }));
        return;
      }
    }
    
    // If this is a katakana field, always convert romaji to katakana
    if (mode === 'katakana') {
      const scriptType = detectScript(inputValue);
      if (scriptType === 'romaji') {
        const conversion = romajiToKatakana(inputValue);
        setAnswers(prev => ({ ...prev, [mode]: conversion.converted }));
        return;
      } else if (scriptType === 'mixed') {
        // For mixed input, extract and convert only the romaji parts
        let result = '';
        let i = 0;
        while (i < inputValue.length) {
          if (/[a-zA-Z]/.test(inputValue[i])) {
            // Find the end of the romaji sequence
            let j = i;
            while (j < inputValue.length && /[a-zA-Z]/.test(inputValue[j])) {
              j++;
            }
            const romajiPart = inputValue.substring(i, j);
            const conversion = romajiToKatakana(romajiPart);
            result += conversion.converted;
            i = j;
          } else {
            result += inputValue[i];
            i++;
          }
        }
        setAnswers(prev => ({ ...prev, [mode]: result }));
        return;
      }
    }
    
    // If this is a romaji field, convert based on output type setting
    if (mode === 'romaji') {
      const scriptType = detectScript(inputValue);
      if (scriptType === 'romaji') {
        let converted = '';
        if (settings.romaji_output_type === 'hiragana') {
          const conversion = romajiToHiragana(inputValue);
          converted = conversion.converted;
        } else if (settings.romaji_output_type === 'katakana') {
          const conversion = romajiToKatakana(inputValue);
          converted = conversion.converted;
        } else {
          // Auto-detect: default to hiragana
          const conversion = romajiToHiragana(inputValue);
          converted = conversion.converted;
        }
        
        if (converted) {
          setAnswers(prev => ({ ...prev, [mode]: converted }));
          return;
        }
      }
    }
    
    // For non-romaji input or when conversion is disabled
    setAnswers(prev => ({ ...prev, [mode]: inputValue }));
  };

  const getEnabledInputModes = () => {
    const modes = [];
    if (settings.input_hiragana) modes.push('hiragana');
    if (settings.input_katakana) modes.push('katakana');
    if (settings.input_kanji) modes.push('kanji');
    if (settings.input_english) modes.push('english');
    if (settings.input_romaji) modes.push('romaji');
    return modes;
  };

  const renderInput = () => {
    const enabledModes = getEnabledInputModes();
    
    // If multiple input modes are enabled, show table format like V1
    if (enabledModes.length > 1) {
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
                  <td className="px-4 py-3 text-white/90 capitalize">
                    {mode}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      ref={(el) => { inputRefs.current[mode] = el; }}
                      type="text"
                      value={answers[mode] || ''}
                      onChange={handleInputChange(mode)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Enter ${mode} answer...`}
                      disabled={disabled}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-transparent disabled:opacity-50",
                        isSubmitting && "opacity-50"
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
    const singleMode = enabledModes[0] || 'answer';
    return (
      <input
        ref={(el) => { inputRefs.current[singleMode] = el; }}
        type="text"
        value={answers[singleMode] || ''}
        onChange={handleInputChange(singleMode)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your answer..."
        disabled={disabled}
        className={cn(
          "w-full px-6 py-4 text-lg rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50",
          isSubmitting && "opacity-50"
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
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!Object.values(answers).some(answer => answer.trim()) || disabled || isSubmitting}
            className="bg-white text-primary hover:bg-white/90 px-8 py-2"
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Button>
        </div>
      </form>
      
      {/* Input hints */}
      <div className="text-center text-white/60 text-sm mt-4">
        <p>Press Enter to submit your answer</p>
        <p className="mt-1">Hiragana/Katakana fields auto-convert romaji input</p>
      </div>
    </div>
  );
}
