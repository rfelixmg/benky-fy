'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { fetchModules } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import { ModulesSkeleton } from '@/components/ui/Skeleton';

interface Module {
  id: string;
  name: string;
  description: string;
  total_cards: number;
  completed: number;
}

export function ModulesList() {
  const { data: modules, error } = useSWR('modules', () => fetchModules(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
    onSuccess: (data) => {
      analytics.track('page_view', {
        page: 'modules',
        module_count: data.length,
      });
    },
    onError: (err) => {
      analytics.track('error', { message: err.message, page: 'modules' });
    },
  });

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!modules) {
    return <ModulesSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module: Module) => (
        <Link
          key={module.id}
          href={`/begginer/${module.id}`}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          onClick={() => {
            analytics.track('module_selected', {
              module_id: module.id,
              module_name: module.name,
            });
          }}
        >
          <h2 className="text-xl font-semibold mb-2">{module.name}</h2>
          <p className="text-gray-600 mb-4">{module.description}</p>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              {module.completed} / {module.total_cards} completed
            </span>
            
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${(module.completed / module.total_cards) * 100}%`,
                }}
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}