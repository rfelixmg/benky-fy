'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Settings as SettingsIcon } from 'lucide-react';

interface ConjugationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedForm: string;
  onFormChange: (form: string) => void;
  moduleName: string;
}

export function ConjugationSettings({
  isOpen,
  onClose,
  selectedForm,
  onFormChange,
  moduleName
}: ConjugationSettingsProps) {
  const availableForms = ['polite', 'negative', 'past', 'past_negative'];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Conjugation Settings
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Module Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Module</h3>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {moduleName}
            </p>
          </div>

          {/* Conjugation Forms */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Available Conjugation Forms
            </h3>
            <div className="space-y-2">
              {availableForms.map((form) => (
                <label
                  key={form}
                  className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="conjugationForm"
                    value={form}
                    checked={selectedForm === form}
                    onChange={() => onFormChange(form)}
                    className="h-4 w-4 text-primary-purple focus:ring-primary-purple border-gray-300"
                  />
                  <span className="text-sm text-gray-900 capitalize">
                    {form.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Selected Form: {selectedForm.replace('_', ' ')}
            </h4>
            <p className="text-sm text-gray-600">
              {getFormDescription(selectedForm)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            className="bg-primary-purple text-white hover:bg-primary-purple/90"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function getFormDescription(form: string): string {
  const descriptions: Record<string, string> = {
    dictionary: 'Base form of the verb (辞書形)',
    polite: 'Polite form ending in -ます (丁寧語)',
    negative: 'Negative form ending in -ない (否定形)',
    polite_negative: 'Polite negative form ending in -ません (丁寧否定形)',
    past: 'Past tense form ending in -た (過去形)',
    polite_past: 'Polite past tense ending in -ました (丁寧過去形)',
    past_negative: 'Past negative form ending in -なかった (過去否定形)',
    te_form: 'Te-form used for connecting verbs (て形)',
    potential: 'Potential form expressing ability (可能形)',
    volitional: 'Volitional form expressing intention (意志形)',
  };

  return descriptions[form] || 'Conjugation form for practice';
}
