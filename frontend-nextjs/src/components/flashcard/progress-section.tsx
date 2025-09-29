'use client';

interface ProgressSectionProps {
  currentItem: number;
  totalItems: number;
  moduleName: string;
}

export function ProgressSection({ currentItem, totalItems, moduleName }: ProgressSectionProps) {
  const progress = (currentItem / totalItems) * 100;
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium">
            {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Progress
          </span>
          <span className="text-white/80 text-sm">
            {currentItem} / {totalItems}
          </span>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-white/60">
          <span>0%</span>
          <span>{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
