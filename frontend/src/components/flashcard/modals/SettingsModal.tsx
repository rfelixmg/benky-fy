import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PracticeMode = 'flashcard' | 'conjugation';
type DisplayMode = 'kana' | 'kanji' | 'kanji_furigana' | 'english' | 'weighted';
type KanaType = 'hiragana' | 'katakana';
type FuriganaStyle = 'hover' | 'inline' | 'brackets' | 'ruby';
type ConjugationForm = 'polite' | 'negative' | 'polite_negative' | 'past' | 'polite_past' | 'past_negative';
type InputMode = 'hiragana' | 'romaji' | 'katakana' | 'kanji' | 'english';

interface Settings {
  practiceMode: PracticeMode;
  displayMode: DisplayMode;
  kanaType: KanaType;
  furiganaStyle: FuriganaStyle;
  weights: {
    kana: number;
    kanji: number;
    kanji_furigana: number;
    english: number;
  };
  conjugationForms: ConjugationForm[];
  conjugationPromptStyle: 'english' | 'kanji' | 'furigana';
  inputModes: InputMode[];
}

const defaultSettings: Settings = {
  practiceMode: 'flashcard',
  displayMode: 'kana',
  kanaType: 'hiragana',
  furiganaStyle: 'ruby',
  weights: {
    kana: 0.3,
    kanji: 0.3,
    kanji_furigana: 0.2,
    english: 0.2,
  },
  conjugationForms: ['polite', 'negative', 'polite_negative', 'past', 'polite_past', 'past_negative'],
  conjugationPromptStyle: 'english',
  inputModes: ['hiragana'],
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useLocalStorage<Settings>('flashcard-settings', defaultSettings);
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    setSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setLocalSettings(defaultSettings);
  };

  const updateWeight = (type: keyof Settings['weights'], value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [type]: value,
      },
    }));
  };

  const toggleConjugationForm = (form: ConjugationForm) => {
    setLocalSettings(prev => ({
      ...prev,
      conjugationForms: prev.conjugationForms.includes(form)
        ? prev.conjugationForms.filter(f => f !== form)
        : [...prev.conjugationForms, form],
    }));
  };

  const toggleInputMode = (mode: InputMode) => {
    setLocalSettings(prev => ({
      ...prev,
      inputModes: prev.inputModes.includes(mode)
        ? prev.inputModes.filter(m => m !== mode)
        : [...prev.inputModes, mode],
    }));
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 mb-4"
                    >
                      Settings
                    </Dialog.Title>

                    {/* Practice Mode */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">Practice Mode</h4>
                      <div className="space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio"
                            checked={localSettings.practiceMode === 'flashcard'}
                            onChange={() => setLocalSettings(prev => ({ ...prev, practiceMode: 'flashcard' }))}
                          />
                          <span className="ml-2">📚 Flashcard</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio"
                            checked={localSettings.practiceMode === 'conjugation'}
                            onChange={() => setLocalSettings(prev => ({ ...prev, practiceMode: 'conjugation' }))}
                          />
                          <span className="ml-2">🔄 Conjugation</span>
                        </label>
                      </div>
                    </div>

                    {/* Flashcard Display Mode */}
                    {localSettings.practiceMode === 'flashcard' && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2">Display Mode</h4>
                        <div className="space-y-2">
                          {(['kana', 'kanji', 'kanji_furigana', 'english', 'weighted'] as const).map((mode) => (
                            <label key={mode} className="block">
                              <input
                                type="radio"
                                className="form-radio"
                                checked={localSettings.displayMode === mode}
                                onChange={() => setLocalSettings(prev => ({ ...prev, displayMode: mode }))}
                              />
                              <span className="ml-2 capitalize">{mode.replace('_', ' ')}</span>
                            </label>
                          ))}
                        </div>

                        {/* Kana Type */}
                        {localSettings.displayMode === 'kana' && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Kana Type</h4>
                            <div className="space-x-4">
                              {(['hiragana', 'katakana'] as const).map((type) => (
                                <label key={type} className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    className="form-radio"
                                    checked={localSettings.kanaType === type}
                                    onChange={() => setLocalSettings(prev => ({ ...prev, kanaType: type }))}
                                  />
                                  <span className="ml-2 capitalize">{type}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Furigana Style */}
                        {localSettings.displayMode === 'kanji_furigana' && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Furigana Style</h4>
                            <select
                              className="form-select mt-1 block w-full"
                              value={localSettings.furiganaStyle}
                              onChange={(e) => setLocalSettings(prev => ({
                                ...prev,
                                furiganaStyle: e.target.value as FuriganaStyle
                              }))}
                            >
                              <option value="hover">Hover (tooltip on kanji)</option>
                              <option value="inline">Inline (above or beside)</option>
                              <option value="brackets">Brackets (e.g., 食[た]べる)</option>
                              <option value="ruby">Ruby (default browser ruby)</option>
                            </select>
                          </div>
                        )}

                        {/* Weighted Display */}
                        {localSettings.displayMode === 'weighted' && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Display Weights</h4>
                            <div className="space-y-4">
                              {(Object.keys(localSettings.weights) as Array<keyof Settings['weights']>).map((type) => (
                                <div key={type} className="flex items-center">
                                  <span className="w-32 capitalize">{type.replace('_', ' ')}</span>
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={localSettings.weights[type]}
                                    onChange={(e) => updateWeight(type, parseFloat(e.target.value))}
                                    className="flex-1 mx-4"
                                  />
                                  <span className="w-12 text-right">{localSettings.weights[type]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Conjugation Settings */}
                    {localSettings.practiceMode === 'conjugation' && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2">Conjugation Forms</h4>
                        <div className="space-y-2">
                          {(['polite', 'negative', 'polite_negative', 'past', 'polite_past', 'past_negative'] as const).map((form) => (
                            <label key={form} className="block">
                              <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={localSettings.conjugationForms.includes(form)}
                                onChange={() => toggleConjugationForm(form)}
                              />
                              <span className="ml-2">{form.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </label>
                          ))}
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium text-gray-700 mb-2">Prompt Style</h4>
                          <div className="space-x-4">
                            {(['english', 'kanji', 'furigana'] as const).map((style) => (
                              <label key={style} className="inline-flex items-center">
                                <input
                                  type="radio"
                                  className="form-radio"
                                  checked={localSettings.conjugationPromptStyle === style}
                                  onChange={() => setLocalSettings(prev => ({
                                    ...prev,
                                    conjugationPromptStyle: style
                                  }))}
                                />
                                <span className="ml-2 capitalize">{style}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Input Modes */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">Answer Input Mode</h4>
                      <div className="space-y-2">
                        {(['hiragana', 'romaji', 'katakana', 'kanji', 'english'] as const).map((mode) => (
                          <label key={mode} className="block">
                            <input
                              type="checkbox"
                              className="form-checkbox"
                              checked={localSettings.inputModes.includes(mode)}
                              onChange={() => toggleInputMode(mode)}
                            />
                            <span className="ml-2">
                              {mode === 'hiragana' ? 'Hiragana (romaji input → auto-converts to kana)' :
                               mode === 'romaji' ? 'Romaji (as typed)' :
                               mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        You can select more than one. Your answer will be accepted if it matches any selected type.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Reset to Defaults
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}