'use client';

import { Suspense } from 'react';
import { FlashcardContainer } from '@/components/flashcard/FlashcardContainer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { FlashcardSkeleton } from '@/components/ui/Skeleton';
import { useParams } from 'next/navigation';

export default function ModulePage() {
  const params = useParams();
  const moduleId = params?.module as string;
  const moduleTitle = moduleId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{moduleTitle}</h1>
      <ErrorBoundary>
        <Suspense fallback={<FlashcardSkeleton />}>
          <FlashcardContainer moduleId={moduleId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}