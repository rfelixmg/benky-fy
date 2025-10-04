'use client';

import { useState } from 'react';
import { validateAnswer, ValidationResult } from '@/lib/validation';
import { FlashcardItem, UserSettings } from '@/lib/api-client';
import { AnswerFeedback } from '@/components/flashcard/answer-feedback';

/**
 * Test component to verify validation respects user settings
 */
export function ValidationSettingsTest() {
  const [testResults, setTestResults] = useState<Array<{
    scenario: string;
    settings: UserSettings;
    userAnswers: { english: string; hiragana: string };
    result: ValidationResult;
    expected: string;
  }>>([]);

  const sampleItem: FlashcardItem = {
    id: '1',
    kanji: '赤',
    hiragana: 'あか',
    english: 'red',
    type: 'color'
  };

  const runTests = () => {
    const tests = [
      {
        scenario: 'English only enabled',
        settings: {
          input_hiragana: false,
          input_katakana: false,
          input_kanji: false,
          input_english: true,
          input_romaji: false,
        } as Partial<UserSettings>,
        userAnswers: { english: 'red', hiragana: 'wrong' },
        expected: 'Should validate only English, ignore Hiragana'
      },
      {
        scenario: 'Hiragana only enabled',
        settings: {
          input_hiragana: true,
          input_katakana: false,
          input_kanji: false,
          input_english: false,
          input_romaji: false,
        } as Partial<UserSettings>,
        userAnswers: { english: 'wrong', hiragana: 'あか' },
        expected: 'Should validate only Hiragana, ignore English'
      },
      {
        scenario: 'Both English and Hiragana enabled',
        settings: {
          input_hiragana: true,
          input_katakana: false,
          input_kanji: false,
          input_english: true,
          input_romaji: false,
        } as Partial<UserSettings>,
        userAnswers: { english: 'red', hiragana: 'あか' },
        expected: 'Should validate both English and Hiragana'
      },
      {
        scenario: 'Both enabled but English wrong',
        settings: {
          input_hiragana: true,
          input_katakana: false,
          input_kanji: false,
          input_english: true,
          input_romaji: false,
        } as Partial<UserSettings>,
        userAnswers: { english: 'wrong', hiragana: 'あか' },
        expected: 'Should show partial success (Hiragana correct, English wrong)'
      }
    ];

    const results = tests.map(test => {
      const fullSettings = {
        ...test.settings,
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
        allowedInputModes: { 
          hiragana: test.settings.input_hiragana || false, 
          katakana: test.settings.input_katakana || false, 
          english: test.settings.input_english || false, 
          kanji: test.settings.input_kanji || false, 
          romaji: test.settings.input_romaji || false 
        },
        romajiConversionEnabled: false,
        autoAdvance: false,
        soundEnabled: false,
        difficulty: 'beginner'
      } as UserSettings;

      const result = validateAnswer(test.userAnswers, sampleItem, true, {
        input_english: fullSettings.input_english,
        input_hiragana: fullSettings.input_hiragana
      });

      return {
        ...test,
        settings: fullSettings,
        result
      };
    });

    setTestResults(results);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">Validation Settings Test</h1>
      
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-2 text-white">Sample Item</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-white/70">Kanji</p>
            <p className="text-2xl font-bold text-white">{sampleItem.kanji}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Hiragana</p>
            <p className="text-2xl font-bold text-white">{sampleItem.hiragana}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">English</p>
            <p className="text-2xl font-bold text-white">{sampleItem.english}</p>
          </div>
        </div>
      </div>

      <button
        onClick={runTests}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
      >
        Run Validation Tests
      </button>

      {testResults.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Test Results</h2>
          {testResults.map((test, index) => (
            <div key={index} className="bg-white/10 p-4 rounded-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">{test.scenario}</h3>
              <p className="text-white/70 mb-3">{test.expected}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-white mb-1">Settings:</h4>
                  <div className="text-sm text-white/80 space-y-1">
                    <p>English: {test.settings.input_english ? '✅' : '❌'}</p>
                    <p>Hiragana: {test.settings.input_hiragana ? '✅' : '❌'}</p>
                    <p>Katakana: {test.settings.input_katakana ? '✅' : '❌'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">User Input:</h4>
                  <div className="text-sm text-white/80 space-y-1">
                    <p>English: "{test.userAnswers.english}"</p>
                    <p>Hiragana: "{test.userAnswers.hiragana}"</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-white mb-2">Validation Result:</h4>
                <div className={`p-3 rounded-lg border ${test.result.feedbackColor}`}>
                  <p className="font-semibold">
                    Overall: {test.result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                  </p>
                  <div className="mt-2 space-y-1">
                    {test.result.results.map((isCorrect, i) => (
                      <p key={i} className="text-sm">
                        {i === 0 && test.settings.input_english && 'English: '}
                        {i === 1 && test.settings.input_hiragana && 'Hiragana: '}
                        {isCorrect ? '✅' : '❌'}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <AnswerFeedback
                item={sampleItem}
                userAnswer={test.userAnswers.english}
                isCorrect={test.result.isCorrect}
                settings={test.settings}
                frontendValidationResult={test.result}
                userAnswers={test.userAnswers}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
