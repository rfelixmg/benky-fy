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
        console.log('Attempting to load numbers from v2 API...');
        
        // Load basic numbers
        const basicResponse = await fetch('/api/v2/words/numbers_basic');
        console.log('Basic numbers API response status:', basicResponse.status);
        
        let basicNumbers: any[] = [];
        if (basicResponse.ok) {
          const basicData = await basicResponse.json();
          console.log('Basic numbers API data received:', basicData);
          basicNumbers = basicData.words || [];
        }

        // Load extended numbers
        const extendedResponse = await fetch('/api/v2/words/numbers_extended');
        console.log('Extended numbers API response status:', extendedResponse.status);
        
        let extendedNumbers: any[] = [];
        if (extendedResponse.ok) {
          const extendedData = await extendedResponse.json();
          console.log('Extended numbers API data received:', extendedData);
          extendedNumbers = extendedData.words || [];
        }

        // Convert v2 API data to module format
        const numbers: NumberData[] = [
          ...basicNumbers.map((word: any) => ({
            kanji: word.kanji || word.hiragana,
            hiragana: word.hiragana,
            value: parseInt(word.english) || 0,
            category: 'basic' as const
          })),
          ...extendedNumbers.map((word: any) => ({
            kanji: word.kanji || word.hiragana,
            hiragana: word.hiragana,
            value: parseInt(word.english) || 0,
            category: 'extended' as const
          }))
        ];

        const practice_sets = [
          {
            id: 'basic-reading',
            numbers: basicNumbers.slice(0, 10).map((word: any) => parseInt(word.english) || 0),
            type: 'reading' as const
          },
          {
            id: 'extended-conversion',
            numbers: extendedNumbers.slice(0, 5).map((word: any) => parseInt(word.english) || 0),
            type: 'conversion' as const
          }
        ];

        const quiz_questions = [
          ...basicNumbers.slice(0, 5).map((word: any) => ({
            id: word.id,
            question: word.hiragana,
            correctAnswer: word.english,
            options: [word.english, 'Wrong 1', 'Wrong 2', 'Wrong 3'],
            hint: word.romaji || word.hiragana
          })),
          ...extendedNumbers.slice(0, 5).map((word: any) => ({
            id: word.id,
            question: word.hiragana,
            correctAnswer: word.english,
            options: [word.english, 'Wrong 1', 'Wrong 2', 'Wrong 3'],
            hint: word.romaji || word.hiragana
          }))
        ];

        setData({
          numbers,
          practice_sets,
          quiz_questions
        });
      } catch (err) {
        console.error('Error loading numbers from v2 API:', err);
        setError(err instanceof Error ? err.message : 'Error loading module data');
      } finally {
        setLoading(false);
      }
    }

    fetchModuleData();
  }, []);

  const handleNumberClick = (character: Character) => {
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
              type: 'noun' as const,
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
