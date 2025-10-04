'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { textStyles, layoutStyles } from '@/styles/components';

interface ColorWord {
  kanji: string;
  hiragana: string;
  english: string;
  hex: string;
}

interface ModuleData {
  colors: ColorWord[];
}

interface ProgressStats {
  total: number;
  selected: ColorWord | null;
}

function ColorModule() {
  const [data, setData] = useState<ModuleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressStats>({
    total: 0,
    selected: null
  });

  useEffect(() => {
    async function fetchModuleData() {
      try {
        const response = await fetch('/api/flashcards/colors');
        if (!response.ok) {
          throw new Error('Failed to load colors data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading module data');
      } finally {
        setLoading(false);
      }
    }

    fetchModuleData();
  }, []);

  if (loading) {
    return (
      <div className={`${layoutStyles.col} ${layoutStyles.center} p-8`}>
        <div className={textStyles.secondary}>Loading colors module...</div>
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
      <h1 className={textStyles['2xl']}>Japanese Colors</h1>
      <p className={textStyles.secondary}>
        Learn color words in Japanese with visual aids.
      </p>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-white/60">
          Colors viewed: <span className="font-bold">{progress.total}</span>
        </div>
        {progress.selected && (
          <div className="text-sm text-white/60">
            Selected: <span className="font-bold">{progress.selected.english}</span>
          </div>
        )}
      </div>

      <Card variant="primary" className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.colors.map((color) => (
            <button
              key={color.kanji}
              onClick={() => {
                setProgress(prev => ({
                  total: prev.total + 1,
                  selected: color
                }));
              }}
              className={`${layoutStyles.col} ${layoutStyles.center} ${layoutStyles.gap.sm} p-4 rounded-lg transition-all duration-300
                ${progress.selected?.kanji === color.kanji ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'}
              `}
            >
              <div 
                className="w-16 h-16 rounded-full border-2 border-white/10"
                style={{ backgroundColor: color.hex }}
              />
              <div className={textStyles.lg}>{color.kanji}</div>
              <div className={textStyles.secondary}>{color.hiragana}</div>
              <div className={textStyles.tertiary}>{color.english}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default ColorModule;
