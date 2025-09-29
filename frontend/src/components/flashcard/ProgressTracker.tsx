interface ProgressTrackerProps {
  stats: {
    total: number;
    completed: number;
    correct: number;
    streak: number;
  };
}

export function ProgressTracker({ stats }: ProgressTrackerProps) {
  const accuracy = stats.completed > 0
    ? Math.round((stats.correct / stats.completed) * 100)
    : 0;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Progress: {stats.completed}/{stats.total}
        </div>
        <div className="text-sm text-gray-600">
          Accuracy: {accuracy}%
        </div>
        <div className="text-sm text-gray-600">
          Streak: {stats.streak}
        </div>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{
            width: `${(stats.completed / stats.total) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}