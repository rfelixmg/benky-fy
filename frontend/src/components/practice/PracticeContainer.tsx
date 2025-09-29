'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { PracticeQuestion } from './PracticeQuestion';
import { ProgressTracker } from '../flashcard/ProgressTracker';
import { analytics } from '@/lib/analytics';

interface PracticeContainerProps {
  moduleId: string;
}

interface Question {
  id: string;
  prompt: string;
  answer: string;
  options?: string[];
  type: 'multiple_choice' | 'text_input';
  hint?: string;
}

export function PracticeContainer({ moduleId }: PracticeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    correct: 0,
    streak: 0,
  });

  const { data: questions, error } = useSWR(
    `practice/${moduleId}`,
    async () => {
      const response = await fetch(`/api/practice/${moduleId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load practice questions');
      return response.json();
    },
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        setStats(prev => ({ ...prev, total: data.length }));
        analytics.track('practice_started', {
          module: moduleId,
          question_count: data.length,
        });
      },
    }
  );

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 mb-4">Failed to load practice questions</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!questions) {
    return <div className="text-center">Loading practice questions...</div>;
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold mb-4">Practice Complete!</h2>
        <p className="mb-4">
          You've completed {stats.correct} out of {stats.total} questions correctly.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setStats(prev => ({ ...prev, completed: 0, correct: 0, streak: 0 }));
            analytics.track('practice_restart', { module: moduleId });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Over
        </button>
      </div>
    );
  }

  const handleAnswer = async (answer: string) => {
    const isCorrect = answer.toLowerCase() === currentQuestion.answer.toLowerCase();
    
    await fetch(`/api/practice/${moduleId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        answer,
        isCorrect,
      }),
      credentials: 'include',
    });

    setStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));

    analytics.track('practice_answer', {
      module: moduleId,
      correct: isCorrect,
      streak: isCorrect ? stats.streak + 1 : 0,
      question_type: currentQuestion.type,
    });

    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressTracker stats={stats} />
      
      <PracticeQuestion
        question={currentQuestion}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
