'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface ModuleWords {
  module: string;
  words: Array<{
    prompt: string;
    answer: string;
    furigana_html?: string;
  }>;
}

export default function DebugModulesPage() {
  const [modules, setModules] = useState<ModuleWords[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllModules = async () => {
      try {
        const moduleNames = [
          'hiragana',
          'katakana',
          'katakana_words',
          'greetings',
          'numbers_basic',
          'colors_basic',
          'days_of_week',
          'months_complete'
        ];

        const results = await Promise.all(
          moduleNames.map(async (module) => {
            try {
              const response = await apiClient.get(`/api/flashcards/begginer/${module}`);
              return {
                module,
                words: response.data.cards || []
              };
            } catch (err) {
              console.warn(`Failed to fetch ${module}:`, err);
              return {
                module,
                words: []
              };
            }
          })
        );

        setModules(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch modules');
      } finally {
        setLoading(false);
      }
    };

    fetchAllModules();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Debug: Module Words</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Debug: Module Words</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug: Module Words</h1>
      
      <div className="space-y-8">
        {modules.map((moduleData) => (
          <div key={moduleData.module} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span>{moduleData.module}</span>
              <span className="text-sm text-gray-500">
                {moduleData.words.length} words
              </span>
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prompt
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Answer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Furigana
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {moduleData.words.map((word, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {word.prompt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {word.answer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {word.furigana_html ? (
                          <div dangerouslySetInnerHTML={{ __html: word.furigana_html }} />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
