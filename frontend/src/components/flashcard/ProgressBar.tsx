'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  correct: number;
}

export function ProgressBar({ current, total, correct }: ProgressBarProps) {
  const progress = (current / total) * 100;
  const accuracy = current > 0 ? (correct / current) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Progress: {current}/{total} cards</span>
        <span>Accuracy: {Math.round(accuracy)}%</span>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-4 text-sm">
        <div className="flex items-center">
          <kbd className="px-2 py-1 bg-gray-100 border rounded-md mr-2">←</kbd>
          <span className="text-gray-600">Incorrect</span>
        </div>
        <div className="flex items-center">
          <kbd className="px-2 py-1 bg-gray-100 border rounded-md mr-2">Space</kbd>
          <span className="text-gray-600">Show Answer</span>
        </div>
        <div className="flex items-center">
          <kbd className="px-2 py-1 bg-gray-100 border rounded-md mr-2">→</kbd>
          <span className="text-gray-600">Correct</span>
        </div>
      </div>
    </div>
  );
}
