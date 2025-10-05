'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { textStyles, progressStyles, layoutStyles, formStyles } from '@/styles/components';

interface ProgressStats {
  correct: number;
  incorrect: number;
  total: number;
  streakCount: number;
  bestStreak: number;
  averageTime: number;
}

interface ProgressTrackerProps {
  stats: ProgressStats;
  onReset: () => void;
  showDetails?: boolean;
}

export function ProgressTracker({
  stats,
  onReset,
  showDetails = true,
}: ProgressTrackerProps): JSX.Element {
  const accuracy = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  }, [stats.correct, stats.total]);

  const progressColor = useMemo(() => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [accuracy]);

  const encouragementMessage = useMemo(() => {
    if (accuracy >= 80) return 'Great progress! Keep it up!';
    if (accuracy >= 60) return 'Good work! Room for improvement.';
    if (stats.total === 0) return 'Start practicing to track your progress!';
    return 'Keep practicing! You\'ll get better.';
  }, [accuracy, stats.total]);

  return (
    <Card variant="primary" className={`${layoutStyles.col} ${layoutStyles.gap.md}`}>
      {/* Progress Bar */}
      <div className={progressStyles.bar.container}>
        <div 
          className={`${progressStyles.bar.progress} ${progressColor}`}
          style={{ width: `${accuracy}%` }}
          role="progressbar"
          aria-valuenow={accuracy}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Main Stats */}
      <div className={`${layoutStyles.row} ${layoutStyles.between} ${layoutStyles.center}`}>
        <div className={`${textStyles.lg} ${textStyles.primary}`}>
          {accuracy}%
        </div>
        <div className={`${textStyles.sm} ${textStyles.secondary}`}>
          {stats.correct}/{stats.total} correct
        </div>
      </div>

      {/* Encouragement */}
      <div className={`${textStyles.sm} ${textStyles.secondary} text-center`}>
        {encouragementMessage}
      </div>

      {/* Detailed Stats */}
      {showDetails && (
        <div className={`${layoutStyles.col} ${layoutStyles.gap.sm} mt-2`}>
          <div className={`${layoutStyles.row} ${layoutStyles.between}`}>
            <div className={textStyles.secondary}>Current Streak:</div>
            <div className={`${textStyles.primary} font-medium`}>{stats.streakCount}</div>
          </div>
          <div className={`${layoutStyles.row} ${layoutStyles.between}`}>
            <div className={textStyles.secondary}>Best Streak:</div>
            <div className={`${textStyles.primary} font-medium`}>{stats.bestStreak}</div>
          </div>
          <div className={`${layoutStyles.row} ${layoutStyles.between}`}>
            <div className={textStyles.secondary}>Average Time:</div>
            <div className={`${textStyles.primary} font-medium`}>{stats.averageTime.toFixed(1)}s</div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className={`
          ${formStyles.button.base}
          ${formStyles.button.secondary}
          mt-4
        `}
      >
        Reset Progress
      </button>
    </Card>
  );
}
