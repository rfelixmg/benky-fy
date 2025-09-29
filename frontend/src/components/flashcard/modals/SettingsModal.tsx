'use client';

import { useState } from 'react';
import { analytics } from '@/lib/analytics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    showFurigana: boolean;
    furiganaStyle: 'html' | 'text';
    allowPartialAnswers: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (key: string, value: boolean | string) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    analytics.track('settings_changed', { [key]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-700">Show Furigana</label>
            <input
              type="checkbox"
              checked={localSettings.showFurigana}
              onChange={(e) => handleChange('showFurigana', e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          </div>

          {localSettings.showFurigana && (
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Furigana Style</label>
              <select
                value={localSettings.furiganaStyle}
                onChange={(e) => handleChange('furiganaStyle', e.target.value)}
                className="form-select border rounded px-2 py-1"
              >
                <option value="html">HTML</option>
                <option value="text">Text</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-gray-700">Allow Partial Answers</label>
            <input
              type="checkbox"
              checked={localSettings.allowPartialAnswers}
              onChange={(e) => handleChange('allowPartialAnswers', e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
