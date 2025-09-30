'use client';

import { FlashcardItem, UserSettings } from '@/lib/api-client';

interface AnswerFeedbackProps {
  item: FlashcardItem;
  userAnswer: string;
  isCorrect: boolean;
  matchedType?: string;
  convertedAnswer?: string;
  settings: UserSettings;
}

export function AnswerFeedback({ 
  item, 
  userAnswer, 
  isCorrect, 
  matchedType, 
  convertedAnswer,
  settings 
}: AnswerFeedbackProps) {
  if (!isCorrect) return null;

  return (
    <div className="mt-4 p-4 bg-white/10 rounded-lg">
      <h4 className="text-sm font-medium text-white mb-3">Answer Feedback</h4>
      
      {/* Response Table */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70">Your Answer:</span>
              <span className="text-white font-medium">{convertedAnswer || userAnswer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Matched Type:</span>
              <span className="text-green-300 font-medium">{matchedType || 'Unknown'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70">Status:</span>
              <span className="text-green-300 font-medium">✓ Correct</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Conversion:</span>
              <span className="text-white/70">
                {convertedAnswer && convertedAnswer !== userAnswer ? 'Applied' : 'None'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Available Answers Table */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-white/70 mb-2">Available answers:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {item.hiragana && (
              <div className="flex justify-between">
                <span className="text-white/60">Hiragana:</span>
                <span className="text-white">{item.hiragana}</span>
              </div>
            )}
            {item.katakana && (
              <div className="flex justify-between">
                <span className="text-white/60">Katakana:</span>
                <span className="text-white">{item.katakana}</span>
              </div>
            )}
            {item.english && (
              <div className="flex justify-between">
                <span className="text-white/60">English:</span>
                <span className="text-white">{item.english}</span>
              </div>
            )}
            {item.kanji && (
              <div className="flex justify-between">
                <span className="text-white/60">Kanji:</span>
                <span className="text-white">{item.kanji}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
