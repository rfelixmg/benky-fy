'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ModulesList } from './ModulesList';
import { ModulesSkeleton } from '@/components/ui/Skeleton';
import { Suspense } from 'react';

export function ModulesWrapper() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ModulesSkeleton />}>
        <ModulesList />
      </Suspense>
    </ErrorBoundary>
  );
}
