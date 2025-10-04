'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { CharacterGrid } from '@/components/japanese/CharacterGrid';
import { CharacterInput } from '@/components/japanese/CharacterInput';
import { PracticeInterface } from '@/components/japanese/PracticeInterface';
import { QuizInterface } from '@/components/japanese/QuizInterface';
import { ProgressTracker } from '@/components/japanese/ProgressTracker';
import { textStyles, layoutStyles, formStyles } from '@/styles/components';
import { withPerformanceTracking } from '@/lib/performance';

type LearningMode = 'basic' | 'extended' | 'practice' | 'quiz';

interface NumberData {
  kanji: string;
  hiragana: string;
  value: number;
  category: 'basic' | 'extended';
}

interface ModuleData {
  numbers: NumberData[];
  practice_sets: Array<{
    id: string;
    numbers: number[];
    type: 'reading' | 'conversion';
  }>;
  quiz_questions: Array<{
    id: string;
    question: string;
    correctAnswer: string;
    options: string[];
    hint: string;
  }>;
}

interface ProgressStats {
  correct: number;
  incorrect: number;
  total: number;
  streakCount: number;
  bestStreak: number;
  averageTime: number;
}

function NumbersModule() {
  const [mode, setMode] = useState<LearningMode>('basic');
  const [data, setData] = useState<ModuleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressStats>({
    correct: 0,
    incorrect: 0,
    total: 0,
    streakCount: 0,
    bestStreak: 0,
    averageTime: 0,
  });

  useEffect(() => {
    async function fetchModuleData() {
      try {
        const response = await fetch('/flashcards/numbers-basic');
        if (!response.ok) {
          throw new Error('Failed to load module data');
        }
        const basicNumbers = await response.json();

        const extendedResponse = await fetch('/flashcards/numbers-extended');
        if (!extendedResponse.ok) {
          throw new Error('Failed to load extended numbers');
        }
        const extendedNumbers = await extendedResponse.json();

        // Combine and categorize numbers
        setData({
          numbers: [
            ...basicNumbers.numbers.map((n: any) => ({ ...n, category: 'basic' })),
            ...extendedNumbers.numbers.map((n: any) => ({ ...n, category: 'extended' })),
          ],
          practice_sets: [
            ...basicNumbers.practice_sets,
            ...extendedNumbers.practice_sets,
          ],
          quiz_questions: [
            ...basicNumbers.quiz_questions,
            ...extendedNumbers.quiz_questions,
          ],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading module data');
      } finally {
        setLoading(false);
      }
    }

    fetchModuleData();
  }, []);

  const handleNumberClick = (number: NumberData) => {
    setProgress(prev => ({
      ...prev,
      total: prev.total + 1,
    }));
  };

  const handlePracticeProgress = (current: number, total: number) => {
    setProgress(prev => ({
      ...prev,
      correct: current,
      total,
      streakCount: current > prev.correct ? prev.streakCount + 1 : 0,
      bestStreak: Math.max(prev.bestStreak, current > prev.correct ? prev.streakCount + 1 : prev.streakCount),
    }));
  };

  const handleQuizProgress = (current: number, total: number) => {
    setProgress(prev => ({
      ...prev,
      correct: current,
      total,
      streakCount: current > prev.correct ? prev.streakCount + 1 : 0,
      bestStreak: Math.max(prev.bestStreak, current > prev.correct ? prev.streakCount + 1 : prev.streakCount),
    }));
  };

  if (loading) {
    return (
      <div className={`${layoutStyles.col} ${layoutStyles.center} p-8`}>
        <div className={textStyles.secondary}>Loading numbers module...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${layoutStyles.col} ${layoutStyles.center} p-8`}>
        <div className={textStyles.error}>{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const currentNumbers = data.numbers.filter(n => 
    mode === 'basic' ? n.category === 'basic' : n.category === 'extended'
  );

  return (
    <div className={`${layoutStyles.col} ${layoutStyles.gap.lg} p-8`}>
      {/* Header */}
      <div className={`${layoutStyles.col} ${layoutStyles.gap.sm}`}>
        <h1 className={textStyles['2xl']}>Japanese Numbers</h1>
        <p className={textStyles.secondary}>
          Learn to read and write Japanese numbers, from basic counting to large quantities.
        </p>
      </div>

      {/* Mode Selection */}
      <div className={`${layoutStyles.row} ${layoutStyles.gap.sm}`}>
        <button
          onClick={() => setMode('basic')}
          className={`
            ${formStyles.button.base}
            ${mode === 'basic' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Basic Numbers
        </button>
        <button
          onClick={() => setMode('extended')}
          className={`
            ${formStyles.button.base}
            ${mode === 'extended' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Extended Numbers
        </button>
        <button
          onClick={() => setMode('practice')}
          className={`
            ${formStyles.button.base}
            ${mode === 'practice' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Practice
        </button>
        <button
          onClick={() => setMode('quiz')}
          className={`
            ${formStyles.button.base}
            ${mode === 'quiz' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Quiz
        </button>
      </div>

      {/* Progress Tracking */}
      <ProgressTracker
        stats={progress}
        onReset={() => setProgress({
          correct: 0,
          incorrect: 0,
          total: 0,
          streakCount: 0,
          bestStreak: 0,
          averageTime: 0,
        })}
      />

      {/* Learning Content */}
      <Card variant="primary" className="p-6">
        {(mode === 'basic' || mode === 'extended') && (
          <div className={`${layoutStyles.col} ${layoutStyles.gap.lg}`}>
            <CharacterGrid
              characters={currentNumbers.map(n => ({
                character: n.kanji,
                reading: n.hiragana,
              }))}
              onCharacterClick={handleNumberClick}
              columns={4}
            />
            <div className={`${layoutStyles.col} ${layoutStyles.center}`}>
              <div className={textStyles.secondary}>
                Click on a number to see its reading and value
              </div>
            </div>
          </div>
        )}

        {mode === 'practice' && (
          <PracticeInterface
            words={data.practice_sets.map(set => ({
              id: set.id,
              kanji: set.numbers.join(', '),
              hiragana: set.numbers.map(n => 
                data.numbers.find(num => num.value === n)?.hiragana || ''
              ).join(', '),
              english: set.numbers.join(', '),
              type: set.type,
            }))}
            onComplete={() => setMode('quiz')}
            onProgress={handlePracticeProgress}
          />
        )}

        {mode === 'quiz' && (
          <QuizInterface
            questions={data.quiz_questions}
            onComplete={() => setMode('basic')}
            onProgress={handleQuizProgress}
            showRomaji
          />
        )}
      </Card>
    </div>
  );
}

// Wrap with performance monitoring
export default withPerformanceTracking(NumbersModule, 'NumbersModule');
