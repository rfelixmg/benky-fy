'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetchFlashcards, submitAnswer } from '@/lib/api';
import { SwipeableCard } from './SwipeableCard';
import { ProgressTracker } from './ProgressTracker';
import { analytics } from '@/lib/analytics';

interface FlashcardContainerProps {
  moduleId: string;
}

interface Flashcard {
  id: string;
  prompt: string;
  answer: string;
  prompt_script?: string;
  furigana_html?: string;
  furigana_text?: string;
  furigana_style?: 'html' | 'text';
}

interface FlashcardResponse {
  cards: Flashcard[];
  progress?: {
    total: number;
    completed: number;
    correct: number;
    streak: number;
  };
}

export function FlashcardContainer({ moduleId }: FlashcardContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    correct: 0,
    streak: 0,
  });

  const { data: response, error } = useSWR<FlashcardResponse>(
    `begginer/${moduleId}`,
    () => fetchFlashcards(moduleId),
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        if (data?.cards) {
          setStats(prev => ({
            ...prev,
            total: data.cards.length,
            ...(data.progress || {}),
          }));
          analytics.track('flashcards_loaded', {
            module: moduleId,
            count: data.cards.length,
          });
        }
      },
    }
  );

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 mb-4">Failed to load flashcards</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!response?.cards) {
    return <div className="text-center">Loading flashcards...</div>;
  }

  const flashcards = response.cards;
  const currentCard = flashcards[currentIndex];

  if (!currentCard) {
    const completionStats = {
      total: stats.total,
      completed: currentIndex,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    };

    analytics.track('module_completed', {
      module: moduleId,
      ...completionStats,
    });

    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold mb-4">Module Complete!</h2>
        <div className="mb-6 space-y-2">
          <p>Cards completed: {completionStats.completed} / {completionStats.total}</p>
          <p>Correct answers: {completionStats.correct}</p>
          <p>Accuracy: {completionStats.accuracy}%</p>
        </div>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setStats(prev => ({ ...prev, completed: 0, correct: 0, streak: 0 }));
            analytics.track('module_restart', { module: moduleId });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Over
        </button>
      </div>
    );
  }

  const handleAnswer = async (isCorrect: boolean) => {
    await submitAnswer(moduleId, currentCard.id, isCorrect);
    
    setStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));

    analytics.track('answer_submitted', {
      module: moduleId,
      correct: isCorrect,
      streak: isCorrect ? stats.streak + 1 : 0,
    });

    setCurrentIndex(prev => prev + 1);
    setShowAnswer(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressTracker stats={stats} />
      
      <SwipeableCard
        question={currentCard.prompt}
        answer={currentCard.answer}
        showAnswer={showAnswer}
        onShowAnswer={() => {
          setShowAnswer(true);
          analytics.track('answer_revealed', { module: moduleId });
        }}
        onAnswer={handleAnswer}
        furiganaHtml={currentCard.furigana_html}
        furiganaText={currentCard.furigana_text}
        furiganaStyle={currentCard.furigana_style}
      />
    </div>
  );
}