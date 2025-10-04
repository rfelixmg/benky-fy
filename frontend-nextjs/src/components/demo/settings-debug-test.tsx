'use client';

import { useState } from 'react';
import { UserSettings } from '@/lib/api-client';
import { AnswerFeedback } from '@/components/flashcard/answer-feedback';

/**
 * Debug component to test settings and validation
 */
export function SettingsDebugTest() {
  const [settings, setSettings] = useState<UserSettings>({
    input_hiragana: true,
    input_katakana: false,
    input_kanji: false,
    input_english: true,
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
  });

  const sampleItem = {
    id: '1',
    kanji: '赤',
    hiragana: 'あか',
    katakana: 'アカ',
    english: 'red',
    type: 'color'
  };

  const userAnswers = {
    hiragana: 'あか',
    katakana: 'wrong',
    kanji: 'wrong',
    english: 'red',
    romaji: 'wrong'
  };

  const frontendValidationResult = {
    isCorrect: false,
    results: [true, false], // hiragana correct, english correct
    feedbackColor: 'bg-emerald-500/20 border-emerald-400 text-emerald-300',
    matchedType: 'partial',
    convertedAnswer: 'あか / red'
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">Settings Debug Test</h1>
      
      {/* Settings Display */}
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-2 text-white">Current Settings</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>Hiragana: {settings.input_hiragana ? '✅' : '❌'}</p>
            <p>Katakana: {settings.input_katakana ? '✅' : '❌'}</p>
            <p>Kanji: {settings.input_kanji ? '✅' : '❌'}</p>
          </div>
          <div>
            <p>English: {settings.input_english ? '✅' : '❌'}</p>
            <p>Romaji: {settings.input_romaji ? '✅' : '❌'}</p>
          </div>
        </div>
      </div>

      {/* Sample Item */}
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-2 text-white">Sample Item</h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-white/70">Kanji</p>
            <p className="text-2xl font-bold text-white">{sampleItem.kanji}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Hiragana</p>
            <p className="text-2xl font-bold text-white">{sampleItem.hiragana}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Katakana</p>
            <p className="text-2xl font-bold text-white">{sampleItem.katakana}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">English</p>
            <p className="text-2xl font-bold text-white">{sampleItem.english}</p>
          </div>
        </div>
      </div>

      {/* User Answers */}
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-2 text-white">User Answers</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>Hiragana: "{userAnswers.hiragana}"</p>
            <p>Katakana: "{userAnswers.katakana}"</p>
            <p>Kanji: "{userAnswers.kanji}"</p>
          </div>
          <div>
            <p>English: "{userAnswers.english}"</p>
            <p>Romaji: "{userAnswers.romaji}"</p>
          </div>
        </div>
      </div>

      {/* AnswerFeedback Component */}
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-2 text-white">AnswerFeedback Component</h2>
        <p className="text-white/70 mb-4">
          Expected: Should only show Hiragana + English rows (Katakana, Kanji, Romaji should be hidden)
        </p>
        
        <AnswerFeedback
          item={sampleItem}
          userAnswer={userAnswers.english}
          isCorrect={false}
          settings={settings}
          frontendValidationResult={frontendValidationResult}
          userAnswers={userAnswers}
        />
      </div>

      {/* Settings Controls */}
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-2 text-white">Toggle Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.input_hiragana}
                onChange={(e) => setSettings(prev => ({ ...prev, input_hiragana: e.target.checked }))}
                className="mr-2"
              />
              Hiragana
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.input_katakana}
                onChange={(e) => setSettings(prev => ({ ...prev, input_katakana: e.target.checked }))}
                className="mr-2"
              />
              Katakana
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.input_kanji}
                onChange={(e) => setSettings(prev => ({ ...prev, input_kanji: e.target.checked }))}
                className="mr-2"
              />
              Kanji
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.input_english}
                onChange={(e) => setSettings(prev => ({ ...prev, input_english: e.target.checked }))}
                className="mr-2"
              />
              English
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.input_romaji}
                onChange={(e) => setSettings(prev => ({ ...prev, input_romaji: e.target.checked }))}
                className="mr-2"
              />
              Romaji
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
