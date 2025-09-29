import { Suspense } from 'react';
import { FlashcardContainer } from '@/components/flashcard/FlashcardContainer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface FlashcardPageProps {
  params: {
    module: string;
  };
}

export default function FlashcardPage({ params }: FlashcardPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {params.module.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </h1>

      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <FlashcardContainer moduleId={params.module} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}