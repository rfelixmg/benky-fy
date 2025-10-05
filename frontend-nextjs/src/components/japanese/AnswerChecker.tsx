'use client';

import { useState, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { romajiToHiragana } from '@/core/romaji-conversion';
import { Furigana } from './furigana';

interface AnswerCheckerProps {
  question: string;
  expectedAnswer: string;
  acceptableAnswers: string[];
  onCorrectAnswer: () => void;
  onIncorrectAnswer: () => void;
}

export function AnswerChecker({
  question,
  expectedAnswer,
  acceptableAnswers,
  onCorrectAnswer,
  onIncorrectAnswer,
}: AnswerCheckerProps): JSX.Element {
  const [answer, setAnswer] = useState<string>('');
  const [error, setError] = useState<string>('');

  const normalizeAnswer = useCallback((input: string): string => {
    // Convert romaji to hiragana if needed
    const isRomaji = /^[a-zA-Z0-9\s]*$/.test(input);
    if (isRomaji) {
      return romajiToHiragana(input.trim().toLowerCase()).converted;
    }
    return input.trim();
  }, []);

  const checkAnswer = useCallback((): void => {
    if (!answer) {
      setError('Please enter an answer');
      return;
    }

    const normalizedInput = normalizeAnswer(answer);
    const isCorrect = [expectedAnswer, ...acceptableAnswers].some(
      validAnswer => normalizeAnswer(validAnswer) === normalizedInput
    );

    if (isCorrect) {
      onCorrectAnswer();
      setAnswer('');
      setError('');
    } else {
      onIncorrectAnswer();
      setError('Incorrect answer. Try again.');
    }
  }, [answer, expectedAnswer, acceptableAnswers, onCorrectAnswer, onIncorrectAnswer, normalizeAnswer]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAnswer(e.target.value);
    setError('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex items-center gap-4">
        <div className="text-2xl">
          <Furigana
            kanji={question}
            mode="ruby"
            showFurigana={false}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/40 focus:outline-none"
            placeholder="Enter your answer..."
            aria-label="Answer input"
          />
          <button
            onClick={checkAnswer}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Check
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
