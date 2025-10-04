'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { EnhancedFurigana } from './furigana';
import { romajiToHiragana } from '@/lib/romaji-conversion';
import { textStyles, layoutStyles, progressStyles, formStyles } from '@/styles/components';

interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
  hint: string;
}

interface QuizInterfaceProps {
  questions: Question[];
  onComplete: () => void;
  onProgress: (current: number, total: number) => void;
  showRomaji?: boolean;
}

export function QuizInterface({
  questions,
  onComplete,
  onProgress,
  showRomaji = false,
}: QuizInterfaceProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowHint(false);
        onProgress(currentIndex + 2, questions.length);
      } else {
        onComplete();
      }
    }, 2000);
  }, [currentIndex, currentQuestion, questions.length, onComplete, onProgress]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const buttons = document.querySelectorAll('[role="option"]');
    
    switch (e.key) {
      case 'ArrowDown':
        if (index < buttons.length - 1) {
          (buttons[index + 1] as HTMLButtonElement).focus();
        }
        break;
      case 'ArrowUp':
        if (index > 0) {
          (buttons[index - 1] as HTMLButtonElement).focus();
        }
        break;
      case 'Enter':
      case ' ':
        handleAnswer(currentQuestion.options[index]);
        break;
      default:
        break;
    }
  }, [currentQuestion, handleAnswer]);

  if (questions.length === 0) {
    return (
      <div className={`${textStyles.secondary} text-center p-4`}>
        No questions available
      </div>
    );
  }

  return (
    <div className={`${layoutStyles.col} ${layoutStyles.gap.lg}`}>
      {/* Progress */}
      <div className={progressStyles.bar.container}>
        <div 
          className={progressStyles.bar.progress}
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={(currentIndex / questions.length) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className={`${layoutStyles.row} ${layoutStyles.between} ${layoutStyles.center}`}>
        <div className={textStyles.secondary}>
          {currentIndex + 1}/{questions.length}
        </div>
        <button
          onClick={() => setShowHint(!showHint)}
          className={`
            ${formStyles.button.base}
            ${formStyles.button.secondary}
            text-sm
          `}
        >
          Hint
        </button>
      </div>

      {/* Question */}
      <Card variant="primary" className={`${layoutStyles.col} ${layoutStyles.center} ${layoutStyles.gap.md}`}>
        <div className={textStyles['2xl']}>
          <EnhancedFurigana
            kanji={currentQuestion.question}
            showRomaji={showRomaji}
          />
        </div>
        {showHint && (
          <div className={`${textStyles.sm} ${textStyles.secondary}`}>
            {currentQuestion.hint}
          </div>
        )}
      </Card>

      {/* Options */}
      <div className={`${layoutStyles.col} ${layoutStyles.gap.sm}`}>
        {currentQuestion.options.map((option, index) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={showFeedback}
            className={`
              ${formStyles.button.base}
              ${
                showFeedback
                  ? option === currentQuestion.correctAnswer
                    ? 'bg-green-500 text-white'
                    : option === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : formStyles.button.disabled
                  : formStyles.button.secondary
              }
            `}
            role="option"
            aria-selected={option === selectedAnswer}
          >
            <div className={layoutStyles.row}>
              <EnhancedFurigana
                kanji={option}
                showRomaji={showRomaji}
              />
              {showRomaji && (
                <span className={`${textStyles.sm} ${textStyles.tertiary} ml-2`}>
                  ({romajiToHiragana(option).converted})
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div 
          className={`
            ${textStyles.sm}
            ${selectedAnswer === currentQuestion.correctAnswer
              ? progressStyles.indicator.success
              : progressStyles.indicator.error}
            text-center
          `}
        >
          {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
        </div>
      )}
    </div>
  );
}
