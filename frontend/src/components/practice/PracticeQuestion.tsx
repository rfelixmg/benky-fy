'use client';

import { useState } from 'react';
import { useJapaneseInput } from '@/hooks/useJapaneseInput';
import { FuriganaText } from '../flashcard/FuriganaText';

interface PracticeQuestionProps {
  question: {
    prompt: string;
    answer: string;
    options?: string[];
    type: 'multiple_choice' | 'text_input';
    hint?: string;
    furiganaHtml?: string;
    furiganaText?: string;
    furiganaStyle?: 'html' | 'text';
  };
  onAnswer: (answer: string) => void;
}

export function PracticeQuestion({ question, onAnswer }: PracticeQuestionProps) {
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const japaneseInput = useJapaneseInput({
    script: 'hiragana',
    allowPartial: true,
  });

  const handleSubmit = (answer: string) => {
    onAnswer(answer);
    setInput('');
    setShowHint(false);
    japaneseInput.setInput('');
  };

  if (question.type === 'multiple_choice' && question.options) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold mb-2">
            {question.furiganaHtml || question.furiganaText ? (
              <FuriganaText
                html={question.furiganaHtml}
                text={question.furiganaText}
                style={question.furiganaStyle}
              />
            ) : (
              question.prompt
            )}
          </div>
          {question.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
          {showHint && (
            <p className="mt-2 text-sm text-gray-600">{question.hint}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSubmit(option)}
              className="w-full px-4 py-2 text-left border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="text-2xl font-bold mb-2">
          {question.furiganaHtml || question.furiganaText ? (
            <FuriganaText
              html={question.furiganaHtml}
              text={question.furiganaText}
              style={question.furiganaStyle}
            />
          ) : (
            question.prompt
          )}
        </div>
        {question.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        )}
        {showHint && (
          <p className="mt-2 text-sm text-gray-600">{question.hint}</p>
        )}
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={japaneseInput.input}
          onChange={(e) => japaneseInput.setInput(e.target.value)}
          placeholder="Type your answer..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {japaneseInput.converted && (
          <div className="text-center text-lg text-gray-600">
            {japaneseInput.converted}
          </div>
        )}

        <button
          onClick={() => handleSubmit(japaneseInput.converted || japaneseInput.input)}
          disabled={!japaneseInput.input}
          className={`w-full px-4 py-2 rounded-lg ${
            japaneseInput.input
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}
