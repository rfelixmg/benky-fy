import React, { useState } from 'react';
import { 
  FlashcardModel, 
  AnswerModel, 
  ProgressModel, 
  SettingsModel 
} from '@/modules/flashcard/models';
import { 
  WordType, 
  InputType, 
  ProgressStatus 
} from '@/modules/flashcard/types';

/**
 * Test component to verify Sprint 4 Flashcard MVC Models work correctly
 */
export function Sprint4ModelsTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFlashcardModel = () => {
    addResult('Testing FlashcardModel...');
    
    try {
      // Test creation
      const flashcard = new FlashcardModel({
        kanji: '赤',
        hiragana: 'あか',
        english: 'red',
        type: WordType.COLOR,
        difficulty: 'beginner'
      });
      
      addResult(`✓ FlashcardModel created: ${flashcard.id}`);
      
      // Test validation
      const validation = flashcard.validate();
      addResult(`✓ Validation result: ${validation.isValid ? 'Valid' : 'Invalid'}`);
      
      // Test JSON serialization
      const json = flashcard.toJSON();
      addResult(`✓ JSON serialization: ${JSON.stringify(json).substring(0, 50)}...`);
      
      // Test cloning
      const clone = flashcard.clone();
      addResult(`✓ Clone created: ${clone.id !== flashcard.id ? 'Different ID' : 'Same ID'}`);
      
      // Test update
      flashcard.update({ english: 'red color' });
      addResult(`✓ Update successful: ${flashcard.getDisplayText('english')}`);
      
    } catch (error) {
      addResult(`✗ FlashcardModel error: ${error}`);
    }
  };

  const testAnswerModel = () => {
    addResult('Testing AnswerModel...');
    
    try {
      // Test creation
      const answer = new AnswerModel({
        flashcardId: 'test-flashcard-1',
        userAnswer: 'red',
        moduleName: 'colors'
      });
      
      addResult(`✓ AnswerModel created: ${answer.id}`);
      
      // Test validation
      const validation = answer.validate();
      addResult(`✓ Validation result: ${validation.isValid ? 'Valid' : 'Invalid'}`);
      
      // Test JSON serialization
      const json = answer.toJSON();
      addResult(`✓ JSON serialization: ${JSON.stringify(json).substring(0, 50)}...`);
      
      // Test cloning
      const clone = answer.clone();
      addResult(`✓ Clone created: ${clone.id !== answer.id ? 'Different ID' : 'Same ID'}`);
      
      // Test validation update
      answer.updateValidation({
        isCorrect: true,
        matchedType: 'english',
        feedback: ['Correct!']
      });
      addResult(`✓ Validation update: ${answer.isCorrect ? 'Correct' : 'Incorrect'}`);
      
    } catch (error) {
      addResult(`✗ AnswerModel error: ${error}`);
    }
  };

  const testProgressModel = () => {
    addResult('Testing ProgressModel...');
    
    try {
      // Test creation
      const progress = new ProgressModel({
        moduleName: 'colors',
        totalItems: 10,
        userId: 'test-user'
      });
      
      addResult(`✓ ProgressModel created: ${progress.id}`);
      
      // Test validation
      const validation = progress.validate();
      addResult(`✓ Validation result: ${validation.isValid ? 'Valid' : 'Invalid'}`);
      
      // Test JSON serialization
      const json = progress.toJSON();
      addResult(`✓ JSON serialization: ${JSON.stringify(json).substring(0, 50)}...`);
      
      // Test cloning
      const clone = progress.clone();
      addResult(`✓ Clone created: ${clone.id !== progress.id ? 'Different ID' : 'Same ID'}`);
      
      // Test progress update
      progress.updateProgress({
        moduleName: 'colors',
        itemId: 'item-1',
        isCorrect: true,
        attempts: 1,
        timeSpent: 5000,
        timestamp: new Date()
      });
      addResult(`✓ Progress update: ${progress.completedItems} items completed`);
      
      // Test accuracy calculation
      addResult(`✓ Accuracy: ${progress.getAccuracy().toFixed(1)}%`);
      
    } catch (error) {
      addResult(`✗ ProgressModel error: ${error}`);
    }
  };

  const testSettingsModel = () => {
    addResult('Testing SettingsModel...');
    
    try {
      // Test creation
      const settings = new SettingsModel({
        input_hiragana: true,
        input_english: true,
        display_mode: 'kanji',
        max_answer_attempts: 5
      });
      
      addResult(`✓ SettingsModel created`);
      
      // Test validation
      const validation = settings.validate();
      addResult(`✓ Validation result: ${validation.isValid ? 'Valid' : 'Invalid'}`);
      
      // Test JSON serialization
      const json = settings.toJSON();
      addResult(`✓ JSON serialization: ${JSON.stringify(json).substring(0, 50)}...`);
      
      // Test cloning
      const clone = settings.clone();
      addResult(`✓ Clone created`);
      
      // Test enabled input types
      const enabledTypes = settings.getEnabledInputTypes();
      addResult(`✓ Enabled input types: ${enabledTypes.join(', ')}`);
      
      // Test input type management
      settings.enableInputType(InputType.KANJI);
      addResult(`✓ Kanji input enabled: ${settings.isInputTypeEnabled(InputType.KANJI)}`);
      
    } catch (error) {
      addResult(`✗ SettingsModel error: ${error}`);
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    addResult('Starting Sprint 4 Models Test Suite...');
    
    testFlashcardModel();
    testAnswerModel();
    testProgressModel();
    testSettingsModel();
    
    addResult('All tests completed!');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Sprint 4 Flashcard MVC Models Test</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Model Tests</h3>
          <div className="space-y-2">
            <button
              onClick={testFlashcardModel}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test FlashcardModel
            </button>
            <button
              onClick={testAnswerModel}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test AnswerModel
            </button>
            <button
              onClick={testProgressModel}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test ProgressModel
            </button>
            <button
              onClick={testSettingsModel}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Test SettingsModel
            </button>
            <button
              onClick={runAllTests}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Run All Tests
            </button>
            <button
              onClick={clearResults}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Run a test to see results.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Architecture Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">MVC Models Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <h4 className="font-medium">Models</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>FlashcardModel</li>
              <li>AnswerModel</li>
              <li>ProgressModel</li>
              <li>SettingsModel</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Type Definitions</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>FlashcardTypes</li>
              <li>AnswerTypes</li>
              <li>ProgressTypes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Features</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>JSON serialization</li>
              <li>Data validation</li>
              <li>Model cloning</li>
              <li>Type safety</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Dependencies</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>Sprint 1: Validation</li>
              <li>Sprint 2: Factory System</li>
              <li>TypeScript interfaces</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
