'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/lib/settings-store';
import { useUpdateSettings } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { X, Settings as SettingsIcon } from 'lucide-react';

interface SettingsModalProps {
  moduleName: string;
  onClose: () => void;
}

export function SettingsModal({ moduleName, onClose }: SettingsModalProps) {
  const { getSettings, updateSettings } = useSettingsStore();
  const updateSettingsMutation = useUpdateSettings();
  const [localSettings, setLocalSettings] = useState(getSettings(moduleName));
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: boolean | string | number | object) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateSettings(moduleName, localSettings);
      await updateSettingsMutation.mutateAsync({
        moduleName,
        settings: localSettings,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(getSettings(moduleName));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          
          {/* Display Mode Settings */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Display Mode
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Mode</label>
                <select
                  value={localSettings.display_mode || 'kana'}
                  onChange={(e) => handleSettingChange('display_mode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="kana">Kana only (hiragana/katakana)</option>
                  <option value="kanji">Kanji only</option>
                  <option value="kanji_furigana">Kanji with furigana</option>
                  <option value="english">English only</option>
                  <option value="weighted">Mixed display (weighted)</option>
                </select>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kana Type</label>
                <select
                  value={localSettings.kana_type || 'hiragana'}
                  onChange={(e) => handleSettingChange('kana_type', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hiragana">Hiragana (ひらがな)</option>
                  <option value="katakana">Katakana (カタカナ)</option>
                </select>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Furigana Style</label>
                <select
                  value={localSettings.furigana_style || 'ruby'}
                  onChange={(e) => handleSettingChange('furigana_style', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ruby">Ruby tags (default browser)</option>
                  <option value="hover">Hover tooltips</option>
                  <option value="inline">Inline text</option>
                  <option value="brackets">Bracket notation</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Answer Input Mode Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Answer Input Mode
            </h3>
            
            {/* Input Type Checkboxes - V1 Structure */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Hiragana</span>
                  <input
                    type="checkbox"
                    checked={localSettings.input_hiragana || false}
                    onChange={(e) => handleSettingChange('input_hiragana', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Romaji</span>
                  <input
                    type="checkbox"
                    checked={localSettings.input_romaji || false}
                    onChange={(e) => handleSettingChange('input_romaji', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Katakana</span>
                  <input
                    type="checkbox"
                    checked={localSettings.input_katakana || false}
                    onChange={(e) => handleSettingChange('input_katakana', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Kanji</span>
                  <input
                    type="checkbox"
                    checked={localSettings.input_kanji || false}
                    onChange={(e) => handleSettingChange('input_kanji', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">English</span>
                  <input
                    type="checkbox"
                    checked={localSettings.input_english || false}
                    onChange={(e) => handleSettingChange('input_english', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <span className="font-medium">💡 Tip:</span> You can select more than one. Your answer will be accepted if it matches any selected type.
              </p>
            </div>
            
          </div>
          
        </div>
        
        <div className="flex gap-3 p-6 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
