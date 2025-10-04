'use client';

import { useState } from 'react';
import { validateAnswer, getFeedbackColor, ValidationResult, validateWithSettings } from '@/lib/validation';
import { FlashcardItem, UserSettings } from '@/lib/api-client';
import { AnswerFeedback } from '@/components/flashcard/answer-feedback';

/**
 * Demo component showcasing the multi-input validation system
 * This component demonstrates both single and multiple input validation modes
 */
export function ValidationDemo() {
  const [singleAnswer, setSingleAnswer] = useState('');
  const [multipleAnswers, setMultipleAnswers] = useState({ english: '', hiragana: '' });
  const [singleResult, setSingleResult] = useState<ValidationResult | null>(null);
  const [multipleResult, setMultipleResult] = useState<ValidationResult | null>(null);

  // Sample flashcard item (red color)
  const sampleItem: FlashcardItem = {
    id: '1',
    kanji: '赤',
    hiragana: 'あか',
    english: 'red',
    type: 'color'
  };

  // Sample settings for single input mode
  const singleInputSettings: UserSettings = {
    input_hiragana: false,
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
    allowedInputModes: { hiragana: false, katakana: false, english: true, kanji: false, romaji: false },
    romajiConversionEnabled: false,
    autoAdvance: false,
    soundEnabled: false,
    difficulty: 'beginner'
  };

  // Sample settings for multiple input mode (hiragana + english only, no katakana)
  const multipleInputSettings: UserSettings = {
    ...singleInputSettings,
    input_hiragana: true,
    input_katakana: false, // Explicitly disabled
    input_english: true,
    allowedInputModes: { hiragana: true, katakana: false, english: true, kanji: false, romaji: false }
  };

  const handleSingleValidation = () => {
    const result = validateAnswer(singleAnswer, sampleItem, singleInputSettings);
    setSingleResult(result);
  };

  const handleMultipleValidation = () => {
    const enabledModes = ['hiragana', 'english']; // Only enabled modes
    const result = validateWithSettings(multipleAnswers, sampleItem, enabledModes);
    setMultipleResult(result);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">Multi-Input Validation Demo</h1>
      
      {/* Sample Item Display */}
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

      {/* Single Input Mode */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Single Input Mode</h2>
        <p className="text-white/70">Display: Kanji (赤), Input: English only</p>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={singleAnswer}
            onChange={(e) => setSingleAnswer(e.target.value)}
            placeholder="Enter English answer..."
            className={`flex-1 px-4 py-2 border rounded-lg ${
              singleResult ? singleResult.feedbackColor : 'border-gray-300'
            }`}
          />
          <button
            onClick={handleSingleValidation}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Validate
          </button>
        </div>

        {singleResult && (
          <AnswerFeedback
            item={sampleItem}
            userAnswer={singleAnswer}
            isCorrect={singleResult.isCorrect}
            settings={singleInputSettings}
            frontendValidationResult={singleResult}
            userAnswers={{ english: singleAnswer }}
          />
        )}
      </div>

      {/* Multiple Input Mode */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Multiple Input Mode</h2>
        <p className="text-white/70">Display: Kanji (赤), Inputs: English + Hiragana (Katakana disabled)</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">English</label>
            <input
              type="text"
              value={multipleAnswers.english}
              onChange={(e) => setMultipleAnswers(prev => ({ ...prev, english: e.target.value }))}
              placeholder="Enter English..."
              className={`w-full px-4 py-2 border rounded-lg ${
                multipleResult ? (multipleResult.results[0] ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-red-500/20 border-red-400 text-red-300') : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Hiragana</label>
            <input
              type="text"
              value={multipleAnswers.hiragana}
              onChange={(e) => setMultipleAnswers(prev => ({ ...prev, hiragana: e.target.value }))}
              placeholder="Enter Hiragana..."
              className={`w-full px-4 py-2 border rounded-lg ${
                multipleResult ? (multipleResult.results[1] ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-red-500/20 border-red-400 text-red-300') : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        <button
          onClick={handleMultipleValidation}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Validate Both
        </button>

        {multipleResult && (
          <AnswerFeedback
            item={sampleItem}
            userAnswer={multipleAnswers.english}
            isCorrect={multipleResult.isCorrect}
            settings={multipleInputSettings}
            frontendValidationResult={multipleResult}
            userAnswers={multipleAnswers}
          />
        )}
      </div>

      {/* Color Legend */}
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h3 className="font-semibold mb-2 text-white">Color Feedback System</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-400 rounded"></div>
            <span className="text-white">All correct: bg-emerald-500/20 border-emerald-400 text-emerald-300</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500/20 border border-amber-400 rounded"></div>
            <span className="text-white">At least one correct: bg-amber-500/20 border-amber-400 text-amber-300</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 border border-red-400 rounded"></div>
            <span className="text-white">All wrong: bg-red-500/20 border-red-400 text-red-300</span>
          </div>
        </div>
      </div>
    </div>
  );
}
