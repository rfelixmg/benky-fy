'use client';

import { useState, useMemo } from 'react';
import { useSettingsStore } from '@/lib/settings-store';
import { useUpdateSettings } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { X, Settings as SettingsIcon } from 'lucide-react';

interface SettingsModalProps {
  moduleName: string;
  onClose: () => void;
}

// Module type detection for context-aware settings
const getModuleType = (moduleName: string) => {
  const moduleTypeMap: Record<string, {
    hasKatakana: boolean;
    hasKanji: boolean;
    hasFurigana: boolean;
    isConjugationModule: boolean;
  }> = {
    'hiragana': { hasKatakana: false, hasKanji: false, hasFurigana: false, isConjugationModule: false },
    'katakana': { hasKatakana: true, hasKanji: false, hasFurigana: false, isConjugationModule: false },
    'katakana_words': { hasKatakana: true, hasKanji: false, hasFurigana: false, isConjugationModule: false },
    'verbs': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: true },
    'adjectives': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: true },
    'base_nouns': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
    'colors_basic': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
    'days_of_week': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
    'greetings_essential': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
    'months_complete': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
    'numbers_basic': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
    'numbers_extended': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
    'question_words': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
    'vocab': { hasKatakana: false, hasKanji: true, hasFurigana: true, isConjugationModule: false },
  };
  
  return moduleTypeMap[moduleName] || { 
    hasKatakana: false, 
    hasKanji: true, 
    hasFurigana: true, 
    isConjugationModule: false 
  };
};

export function SettingsModal({ moduleName, onClose }: SettingsModalProps) {
  const { getSettings, updateSettings } = useSettingsStore();
  const updateSettingsMutation = useUpdateSettings();
  const [localSettings, setLocalSettings] = useState(getSettings(moduleName));
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    display: true,
    input: true,
    conjugation: true,
  });
  
  // Context-aware module type detection
  const moduleType = useMemo(() => getModuleType(moduleName), [moduleName]);

  const handleSettingChange = (key: string, value: boolean | string | number | object) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving settings:', { moduleName, localSettings });
      updateSettings(moduleName, localSettings);
      await updateSettingsMutation.mutateAsync({
        moduleName,
        settings: localSettings,
      });
      console.log('Settings saved successfully');
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
        
        <div className="p-6 space-y-4">
          
          {/* Display Mode Settings - V1 Style Collapsible */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <div 
              className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSection('display')}
            >
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Display Mode
              </h3>
              <span className="text-gray-500 text-sm transition-transform">
                {expandedSections.display ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.display && (
              <div className="p-4 bg-white">
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
              
              {/* Kana Type - Show for all modules that use kana (hiragana or katakana) */}
              {(moduleType.hasKatakana || moduleName === 'hiragana') && (
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
              )}
              
              {/* Furigana Style - Only show for modules that have kanji/furigana content */}
              {moduleType.hasFurigana && (
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
              )}
              </div>
            </div>
          )}
          </div>
          
          {/* Answer Input Mode Section - V1 Style Collapsible */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <div 
              className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSection('input')}
            >
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Answer Input Mode
              </h3>
              <span className="text-gray-500 text-sm transition-transform">
                {expandedSections.input ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.input && (
              <div className="p-4 bg-white">
            
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
                
                {/* Katakana input - Only show for modules that have katakana content */}
                {moduleType.hasKatakana && (
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Katakana</span>
                    <input
                      type="checkbox"
                      checked={localSettings.input_katakana || false}
                      onChange={(e) => handleSettingChange('input_katakana', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                )}
                
                {/* Kanji input - Only show for modules that have kanji content */}
                {moduleType.hasKanji && (
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Kanji</span>
                    <input
                      type="checkbox"
                      checked={localSettings.input_kanji || false}
                      onChange={(e) => handleSettingChange('input_kanji', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                )}
                
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
          )}
          </div>
          
          {/* Conjugation Input Style Section - Only for conjugation modules */}
          {moduleType.isConjugationModule && (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <div 
                className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => toggleSection('conjugation')}
              >
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Conjugation Input Style
                </h3>
                <span className="text-gray-500 text-sm transition-transform">
                  {expandedSections.conjugation ? '▼' : '▶'}
                </span>
              </div>
              
              {expandedSections.conjugation && (
                <div className="p-4 bg-white">
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Input Format</label>
                  <select
                    value={localSettings.conjugation_input_style || 'table'}
                    onChange={(e) => handleSettingChange('conjugation_input_style', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="table">Table format (recommended)</option>
                    <option value="dropdown">Dropdown selection</option>
                    <option value="inline">Inline inputs</option>
                    <option value="cards">Card-based layout</option>
                  </select>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Show Hints</label>
                  <select
                    value={localSettings.conjugation_hints || 'on_error'}
                    onChange={(e) => handleSettingChange('conjugation_hints', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="never">Never show hints</option>
                    <option value="on_error">Show on incorrect answer</option>
                    <option value="always">Always show hints</option>
                  </select>
                </div>
              </div>
              </div>
            )}
            </div>
          )}
          
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
