import React, { useState } from 'react';
import { AnswerInput } from '@/components/flashcard/answer-input';
import { UserSettings, FlashcardItem } from '@/lib/api-client';

/**
 * Test component to verify Sprint 3 AnswerInput refactor works correctly
 */
export function Sprint3AnswerInputTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  // Sample settings for testing
  const testSettings: UserSettings = {
    input_hiragana: true,
    input_katakana: false,
    input_english: true,
    input_kanji: false,
    input_romaji: false,
    display_mode: 'kanji',
    furigana_style: 'above',
    conjugation_forms: [],
    practice_mode: 'flashcard',
    priority_filter: 'all',
    learning_order: false,
    proportions: { kana: 0.3, kanji: 0.3, kanji_furigana: 0.2, english: 0.2 },
    romaji_enabled: false,
    romaji_output_type: 'hiragana',
    max_answer_attempts: 3,
    flashcard_type: 'standard',
    kana_type: 'hiragana',
    furiganaEnabled: false,
    romajiEnabled: false,
    darkMode: false,
    allowedInputModes: { hiragana: true, katakana: false, english: true, kanji: false, romaji: false },
    romajiConversionEnabled: false,
    autoAdvance: false,
    soundEnabled: false,
    difficulty: 'beginner'
  };

  // Sample flashcard item
  const testItem: FlashcardItem = {
    id: '1',
    kanji: '赤',
    hiragana: 'あか',
    english: 'red',
    type: 'color'
  };

  const handleAnswerSubmit = (answer: string | { english: string; hiragana: string; katakana?: string; kanji?: string; romaji?: string }, validationResult?: any) => {
    const resultMessage = `Answer submitted: ${JSON.stringify(answer)} | Validation: ${JSON.stringify(validationResult)}`;
    setTestResults(prev => [...prev, resultMessage]);
    console.log('Answer submitted:', answer);
    console.log('Validation result:', validationResult);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Sprint 3 AnswerInput Refactor Test</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Component */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Refactored AnswerInput Component</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <AnswerInput
              onSubmit={handleAnswerSubmit}
              disabled={false}
              settings={testSettings}
              currentItem={testItem}
              moduleName="colors"
              enableServerValidation={true}
              enableRealtimeFeedback={true}
            />
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <button
              onClick={clearResults}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear
            </button>
          </div>
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Try submitting an answer.</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm bg-white p-2 rounded border">
                    <strong>Test {index + 1}:</strong> {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Component Architecture Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Refactored Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <h4 className="font-medium">Main Component</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>AnswerInput.tsx (under 100 lines)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Sub-Components</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>SingleInputField.tsx</li>
              <li>MultiInputTable.tsx</li>
              <li>InputModeSelector.tsx</li>
              <li>SubmitButton.tsx</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Custom Hooks</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>useInputValidation.ts</li>
              <li>useRomajiConversion.ts</li>
              <li>useInputFocus.ts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Utilities</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>inputModeUtils.ts</li>
              <li>validationHelpers.ts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
