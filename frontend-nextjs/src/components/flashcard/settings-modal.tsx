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

  const handleSettingChange = (key: string, value: boolean | string) => {
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
          {/* Display Settings */}
          <div>
            <h3 className="font-medium mb-4">Display Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Show Furigana</span>
                <input
                  type="checkbox"
                  checked={localSettings.furiganaEnabled}
                  onChange={(e) => handleSettingChange('furiganaEnabled', e.target.checked)}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm">Show Romaji</span>
                <input
                  type="checkbox"
                  checked={localSettings.romajiEnabled}
                  onChange={(e) => handleSettingChange('romajiEnabled', e.target.checked)}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm">Dark Mode</span>
                <input
                  type="checkbox"
                  checked={localSettings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  className="rounded"
                />
              </label>
            </div>
          </div>
          
          {/* Learning Settings */}
          <div>
            <h3 className="font-medium mb-4">Learning Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Auto Advance</span>
                <input
                  type="checkbox"
                  checked={localSettings.autoAdvance}
                  onChange={(e) => handleSettingChange('autoAdvance', e.target.checked)}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm">Sound Effects</span>
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="rounded"
                />
              </label>
              
              <div>
                <label className="text-sm block mb-2">Difficulty Level</label>
                <select
                  value={localSettings.difficulty}
                  onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
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
