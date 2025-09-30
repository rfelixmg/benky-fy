'use client';

import { useWordsData } from '@/lib/hooks';
import { Loader2, BarChart3, BookOpen, Target } from 'lucide-react';

interface ConjugationStatsProps {
  moduleName: string;
}

export function ConjugationStats({ moduleName }: ConjugationStatsProps) {
  const { data: wordsData, isLoading, error } = useWordsData(moduleName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
        <span className="ml-2 text-white">Loading statistics...</span>
      </div>
    );
  }

  if (error || !wordsData) {
    return (
      <div className="text-center p-8">
        <p className="text-white/80">Failed to load conjugation statistics.</p>
      </div>
    );
  }

  const totalItems = wordsData.length;
  const verbCount = wordsData.filter(word => word.type === 'verb').length;
  const adjectiveCount = wordsData.filter(word => word.type === 'adjective').length;
  const nounCount = wordsData.filter(word => word.type === 'noun').length;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-white" />
        <h3 className="text-lg font-semibold text-white">
          Conjugation Statistics
        </h3>
      </div>

      {/* Module Overview */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-white/80" />
          <span className="text-white/80 text-sm">Module: {moduleName}</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {totalItems} Total Items
        </div>
      </div>

      {/* Type Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80 mb-3">Word Types:</h4>
        {[
          { type: 'Verbs', count: verbCount },
          { type: 'Adjectives', count: adjectiveCount },
          { type: 'Nouns', count: nounCount }
        ].map(({ type, count }) => (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-white/60" />
              <span className="text-white capitalize">
                {type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (count / totalItems) * 100 : 0}%` }}
                />
              </div>
              <span className="text-white font-semibold min-w-[2rem] text-right">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="text-center">
          <p className="text-white/80 text-sm">
            Practice all conjugation types to master {moduleName}
          </p>
        </div>
      </div>
    </div>
  );
}
