'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { CharacterGrid } from '@/components/japanese/CharacterGrid';
import { Character } from '@/components/japanese/CharacterGrid';
import { CharacterInput } from '@/components/japanese/CharacterInput';
import { PracticeInterface } from '@/components/japanese/PracticeInterface';
import { QuizInterface } from '@/components/japanese/QuizInterface';
import { ProgressTracker } from '@/components/japanese/ProgressTracker';
import { textStyles, layoutStyles, formStyles } from '@/styles/components';
import { withPerformanceTracking } from '@/lib/performance';

type TimeCategory = 'days' | 'months';
type LearningMode = 'explore' | 'write' | 'practice' | 'quiz';

interface TimeUnit {
  kanji: string;
  hiragana: string;
  english: string;
  category: TimeCategory;
  order: number;
}

interface ModuleData {
  units: TimeUnit[];
  practice_sets: Array<{
    id: string;
    units: string[];
    type: 'reading' | 'ordering';
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

function TimeModule() {
  const [category, setCategory] = useState<TimeCategory>('days');
  const [mode, setMode] = useState<LearningMode>('explore');
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
        const daysResponse = await fetch('/flashcards/days-of-week');
        if (!daysResponse.ok) {
          throw new Error('Failed to load days data');
        }
        const daysData = await daysResponse.json();

        const monthsResponse = await fetch('/flashcards/months');
        if (!monthsResponse.ok) {
          throw new Error('Failed to load months data');
        }
        const monthsData = await monthsResponse.json();

        // Combine and categorize time units
        setData({
          units: [
            ...daysData.units.map((u: any, i: number) => ({ ...u, category: 'days', order: i + 1 })),
            ...monthsData.units.map((u: any, i: number) => ({ ...u, category: 'months', order: i + 1 })),
          ],
          practice_sets: [
            ...daysData.practice_sets,
            ...monthsData.practice_sets,
          ],
          quiz_questions: [
            ...daysData.quiz_questions,
            ...monthsData.quiz_questions,
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

  const handleUnitClick = (character: Character) => {
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
        <div className={textStyles.secondary}>Loading time module...</div>
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

  const currentUnits = data.units
    .filter(u => u.category === category)
    .sort((a, b) => a.order - b.order);

  return (
    <div className={`${layoutStyles.col} ${layoutStyles.gap.lg} p-8`}>
      {/* Header */}
      <div className={`${layoutStyles.col} ${layoutStyles.gap.sm}`}>
        <h1 className={textStyles['2xl']}>Japanese Time Units</h1>
        <p className={textStyles.secondary}>
          Learn days of the week and months in Japanese.
        </p>
      </div>

      {/* Category Selection */}
      <div className={`${layoutStyles.row} ${layoutStyles.gap.sm}`}>
        <button
          onClick={() => setCategory('days')}
          className={`
            ${formStyles.button.base}
            ${category === 'days' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Days of Week
        </button>
        <button
          onClick={() => setCategory('months')}
          className={`
            ${formStyles.button.base}
            ${category === 'months' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Months
        </button>
      </div>

      {/* Mode Selection */}
      <div className={`${layoutStyles.row} ${layoutStyles.gap.sm}`}>
        <button
          onClick={() => setMode('explore')}
          className={`
            ${formStyles.button.base}
            ${mode === 'explore' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Explore
        </button>
        <button
          onClick={() => setMode('write')}
          className={`
            ${formStyles.button.base}
            ${mode === 'write' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Write
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
        {mode === 'explore' && (
          <div className={`${layoutStyles.col} ${layoutStyles.gap.lg}`}>
            <CharacterGrid
              characters={currentUnits.map(u => ({
                character: u.kanji,
                reading: u.hiragana,
              }))}
              onCharacterClick={handleUnitClick}
              columns={4}
            />
            <div className={`${layoutStyles.col} ${layoutStyles.center}`}>
              <div className={textStyles.secondary}>
                Click on a time unit to see its reading
              </div>
            </div>
          </div>
        )}

        {mode === 'write' && currentUnits.length > 0 && (
          <div className={`${layoutStyles.col} ${layoutStyles.gap.lg}`}>
            <div className={`${layoutStyles.row} ${layoutStyles.center}`}>
              <div className={textStyles['2xl']}>
                {currentUnits[0].kanji}
              </div>
            </div>
            <CharacterInput
              character={currentUnits[0].kanji}
              onSubmit={(result) => {
                setProgress(prev => ({
                  ...prev,
                  correct: prev.correct + (result.isCorrect ? 1 : 0),
                  incorrect: prev.incorrect + (result.isCorrect ? 0 : 1),
                  total: prev.total + 1,
                  streakCount: result.isCorrect ? prev.streakCount + 1 : 0,
                  bestStreak: Math.max(prev.bestStreak, result.isCorrect ? prev.streakCount + 1 : prev.streakCount),
                }));
              }}
            />
          </div>
        )}

        {mode === 'practice' && (
          <PracticeInterface
            words={data.practice_sets
              .filter(set => set.units.every(u => 
                currentUnits.some(cu => cu.kanji === u || cu.hiragana === u)
              ))
              .map(set => ({
                id: set.id,
                kanji: set.units.join(', '),
                hiragana: set.units.map(u => 
                  currentUnits.find(cu => cu.kanji === u)?.hiragana || u
                ).join(', '),
                english: set.units.map(u =>
                  currentUnits.find(cu => cu.kanji === u)?.english || u
                ).join(', '),
                type: set.type,
              }))}
            onComplete={() => setMode('quiz')}
            onProgress={handlePracticeProgress}
          />
        )}

        {mode === 'quiz' && (
          <QuizInterface
            questions={data.quiz_questions.filter(q =>
              currentUnits.some(u => u.kanji === q.question || u.hiragana === q.question)
            )}
            onComplete={() => setMode('explore')}
            onProgress={handleQuizProgress}
            showRomaji
          />
        )}
      </Card>
    </div>
  );
}

// Wrap with performance monitoring
export default withPerformanceTracking(TimeModule, 'TimeModule');
