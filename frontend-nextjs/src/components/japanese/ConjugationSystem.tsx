'use client';

import { useState, useEffect } from 'react';
import { Furigana } from './furigana';

interface BaseForm {
  kanji: string;
  hiragana: string;
  english: string;
  type: 'verb' | 'adjective' | 'noun';
}

interface ConjugationForm {
  form: string;
  kanji: string;
  hiragana: string;
}

interface ConjugationData {
  word_id: string;
  base_form: BaseForm;
  conjugations: ConjugationForm[];
}

interface ConjugationSystemProps {
  wordId: string;
}

export function ConjugationSystem({ wordId }: ConjugationSystemProps): JSX.Element {
  const [data, setData] = useState<ConjugationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);

  useEffect(() => {
    async function fetchConjugations() {
      try {
        const response = await fetch(`/v2/conjugation/${wordId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Word not found');
          }
          throw new Error('Error loading conjugations');
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading conjugations');
      } finally {
        setLoading(false);
      }
    }

    fetchConjugations();
  }, [wordId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/70">Loading conjugations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { base_form, conjugations } = data;

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Base Form */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white/90">Base Form</h2>
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
          <div className="text-2xl">
            <Furigana
              kanji={base_form.kanji}
              hiragana={base_form.hiragana}
              mode="ruby"
              showFurigana={showFurigana}
            />
          </div>
          <div className="text-white/70">{base_form.english}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowFurigana(!showFurigana)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Toggle furigana"
        >
          {showFurigana ? 'Hide' : 'Show'} Furigana
        </button>
      </div>

      {/* Conjugation Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conjugations.map((conj, index) => (
          <button
            key={conj.form}
            className="flex flex-col gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
            tabIndex={0}
          >
            <div className="text-sm font-medium text-white/70 capitalize">
              {conj.form.replace('_', ' ')}
            </div>
            <div className="text-xl">
              <Furigana
                kanji={conj.kanji}
                hiragana={conj.hiragana}
                mode="ruby"
                showFurigana={showFurigana}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
