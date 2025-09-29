'use client';

import { useState, useRef, useEffect } from 'react';
import { UserSettings } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled: boolean;
  settings: UserSettings;
}

export function AnswerInput({ onSubmit, disabled, settings }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim() || disabled || isSubmitting) return;
    
    setIsSubmitting(true);
    await onSubmit(answer.trim());
    setAnswer('');
    setIsSubmitting(false);
    
    // Refocus input after submission
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSubmitting}
            placeholder="Type your answer here..."
            className={cn(
              "w-full px-4 py-3 text-lg rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-200",
              disabled && "opacity-50 cursor-not-allowed",
              isSubmitting && "opacity-75"
            )}
            autoComplete="off"
            spellCheck="false"
          />
          
          {isSubmitting && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!answer.trim() || disabled || isSubmitting}
            className="bg-white text-primary hover:bg-white/90 px-8 py-2"
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Button>
        </div>
      </form>
      
      {/* Input hints */}
      <div className="text-center text-white/60 text-sm mt-4">
        <p>Press Enter to submit your answer</p>
        {settings.romajiEnabled && (
          <p className="mt-1">Romaji input is enabled</p>
        )}
      </div>
    </div>
  );
}
