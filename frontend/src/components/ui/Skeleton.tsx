export function ModulesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-6 bg-white rounded-lg shadow-md animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="mt-6 flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="w-32 h-2 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FlashcardSkeleton() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="text-center mb-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        </div>
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
        <div className="flex justify-between mt-6">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}