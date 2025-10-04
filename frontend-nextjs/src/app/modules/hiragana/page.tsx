'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { CharacterGrid } from '@/components/japanese/CharacterGrid';
import { CharacterInput } from '@/components/japanese/CharacterInput';
import { PracticeInterface } from '@/components/japanese/PracticeInterface';
import { QuizInterface } from '@/components/japanese/QuizInterface';
import { ProgressTracker } from '@/components/japanese/ProgressTracker';
import { textStyles, layoutStyles, formStyles } from '@/styles/components';

type LearningMode = 'characters' | 'practice' | 'quiz' | 'write';

interface ModuleData {
  characters: Array<{ character: string; reading: string }>;
  practice_words: Array<{
    id: string;
    hiragana: string;
    english: string;
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

export default function HiraganaModule() {
  const [mode, setMode] = useState<LearningMode>('characters');
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
        console.log('Attempting to load hiragana from v2 API...');
        const response = await fetch('/api/v2/words/hiragana');
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API data received:', data);
          
          if (data.words && data.words.length > 0) {
            // Convert v2 API data to module format
            const characters = data.words.map((word: any) => ({
              character: word.hiragana,
              reading: word.romaji || word.hiragana
            }));
            
            const practice_words = data.words.map((word: any) => ({
              id: word.id,
              hiragana: word.hiragana,
              english: Array.isArray(word.english) ? word.english.join(', ') : word.english
            }));
            
            const quiz_questions = data.words.slice(0, 10).map((word: any) => ({
              id: word.id,
              question: word.hiragana,
              correctAnswer: Array.isArray(word.english) ? word.english[0] : word.english,
              options: [
                Array.isArray(word.english) ? word.english[0] : word.english,
                'Wrong Answer 1',
                'Wrong Answer 2',
                'Wrong Answer 3'
              ],
              hint: word.romaji || word.hiragana
            }));
            
            setData({
              characters,
              practice_words,
              quiz_questions
            });
          }
        } else {
          console.error('API response not ok:', response.status, response.statusText);
          setError('Failed to load hiragana data');
        }
      } catch (err) {
        console.error('Error loading hiragana from v2 API:', err);
        setError(err instanceof Error ? err.message : 'Error loading module data');
      } finally {
        setLoading(false);
      }
    }

    fetchModuleData();
  }, []);

  const handleCharacterClick = (char: { character: string; reading: string }) => {
    // Track character exploration
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
        <div className={textStyles.secondary}>Loading hiragana module...</div>
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

  return (
    <div className={`${layoutStyles.col} ${layoutStyles.gap.lg} p-8`}>
      {/* Header */}
      <div className={`${layoutStyles.col} ${layoutStyles.gap.sm}`}>
        <h1 className={textStyles['2xl']}>Hiragana</h1>
        <p className={textStyles.secondary}>
          Basic Japanese writing system used for native words and grammatical elements.
        </p>
      </div>

      {/* Mode Selection */}
      <div className={`${layoutStyles.row} ${layoutStyles.gap.sm}`}>
        <button
          onClick={() => setMode('characters')}
          className={`
            ${formStyles.button.base}
            ${mode === 'characters' ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Characters
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
        {mode === 'characters' && (
          <CharacterGrid
            characters={data.characters}
            onCharacterClick={handleCharacterClick}
            columns={4}
          />
        )}

        {mode === 'write' && (
          <div className={`${layoutStyles.col} ${layoutStyles.gap.lg}`}>
            <div className={`${layoutStyles.row} ${layoutStyles.center}`}>
              <div className={textStyles['2xl']}>
                {data.characters[0].character}
              </div>
            </div>
            <CharacterInput
              character={data.characters[0].character}
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
            words={data.practice_words.map(word => ({
              id: word.id,
              kanji: '',
              hiragana: word.hiragana,
              english: word.english,
              type: 'noun',
            }))}
            onComplete={() => setMode('quiz')}
            onProgress={handlePracticeProgress}
          />
        )}

        {mode === 'quiz' && (
          <QuizInterface
            questions={data.quiz_questions}
            onComplete={() => setMode('characters')}
            onProgress={handleQuizProgress}
            showRomaji
          />
        )}
      </Card>
    </div>
  );
}
