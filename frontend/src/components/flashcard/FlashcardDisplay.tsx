import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useState } from 'react';

interface FlashcardProps {
  question: string;
  answer: string;
  onAnswer: (isCorrect: boolean) => void;
}

export function FlashcardDisplay({ question, answer, onAnswer }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = userAnswer.trim().toLowerCase() === answer.toLowerCase();
    onAnswer(isCorrect);
    setShowAnswer(true);
  };

  return (
    <ErrorBoundary>
      <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-2xl font-bold mb-4">{question}</div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Type your answer..."
            disabled={showAnswer}
          />
          
          {!showAnswer ? (
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Check Answer
            </button>
          ) : (
            <div className="space-y-2">
              <div className={`text-lg font-medium ${userAnswer.trim().toLowerCase() === answer.toLowerCase() ? 'text-green-600' : 'text-red-600'}`}>
                {userAnswer.trim().toLowerCase() === answer.toLowerCase() ? 'Correct!' : 'Incorrect'}
              </div>
              <div className="text-gray-600">
                Correct answer: <span className="font-medium">{answer}</span>
              </div>
              <button
                onClick={() => {
                  setShowAnswer(false);
                  setUserAnswer('');
                }}
                className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                Next Card
              </button>
            </div>
          )}
        </form>
      </div>
    </ErrorBoundary>
  );
}
