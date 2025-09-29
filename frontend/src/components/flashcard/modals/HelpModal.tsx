'use client';

import { useEffect, useState } from 'react';
import { analytics } from '@/lib/analytics';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
}

interface WordInfo {
  reading?: string;
  meaning?: string;
  examples?: string[];
  notes?: string;
}

export function HelpModal({ isOpen, onClose, word }: HelpModalProps) {
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && word) {
      setLoading(true);
      setError(null);

      fetch(`/api/help/word-info?word=${encodeURIComponent(word)}`)
        .then(response => response.json())
        .then(data => {
          setWordInfo(data);
          analytics.track('word_info_viewed', { word });
        })
        .catch(err => {
          setError('Failed to load word information');
          analytics.track('word_info_error', { word, error: err.message });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, word]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Word Information</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading word information...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        ) : wordInfo ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">Reading</h3>
              <p>{wordInfo.reading}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">Meaning</h3>
              <p>{wordInfo.meaning}</p>
            </div>

            {wordInfo.examples && wordInfo.examples.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700">Examples</h3>
                <ul className="list-disc list-inside">
                  {wordInfo.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}

            {wordInfo.notes && (
              <div>
                <h3 className="font-semibold text-gray-700">Notes</h3>
                <p>{wordInfo.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No information available for this word.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
