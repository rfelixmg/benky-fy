import React, { useState, useEffect } from 'react';
import { 
  useFlashcard, 
  useAnswer, 
  useProgress, 
  useSettings 
} from '../modules/flashcard/hooks';
import { FlashcardItem, WordType } from '../modules/flashcard/types/FlashcardTypes';
import { InputType } from '../modules/flashcard/types/AnswerTypes';

/**
 * HooksTestComponent - Test component for Sprint 8 hooks
 * Demonstrates the new MVC hooks architecture with comprehensive testing
 */
export const HooksTestComponent: React.FC = () => {
  // Initialize all hooks
  const flashcardHook = useFlashcard();
  const answerHook = useAnswer();
  const progressHook = useProgress();
  const settingsHook = useSettings();

  const [testResults, setTestResults] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<'beginner' | 'intermediate' | 'advanced' | 'custom'>('beginner');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'completed'>('idle');

  // Mock data
  const mockFlashcards: FlashcardItem[] = [
    {
      id: 'test-1',
      hiragana: 'あか',
      english: 'red',
      type: WordType.COLOR,
      difficulty: 'beginner'
    },
    {
      id: 'test-2',
      hiragana: 'あお',
      english: 'blue',
      type: WordType.COLOR,
      difficulty: 'beginner'
    },
    {
      id: 'test-3',
      hiragana: 'みどり',
      english: 'green',
      type: WordType.COLOR,
      difficulty: 'intermediate'
    }
  ];

  const mockSettings = {
    display_mode: 'kana',
    kana_type: 'hiragana',
    input_hiragana: true,
    input_english: true,
    input_katakana: false,
    input_kanji: false,
    input_romaji: false,
    furigana_style: 'ruby',
    romajiEnabled: false,
    show_feedback: true,
    strict_mode: false
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runHooksTests = async () => {
    setTestStatus('testing');
    setTestResults([]);
    
    try {
      // Test 1: Settings Hook
      addTestResult('🧪 Testing useSettings hook...');
      
      await settingsHook.loadSettings('colors');
      addTestResult('✅ useSettings.loadSettings() - SUCCESS');
      
      settingsHook.enableInputType(InputType.HIRAGANA);
      addTestResult('✅ useSettings.enableInputType() - SUCCESS');
      
      settingsHook.setDisplayMode('kanji');
      addTestResult('✅ useSettings.setDisplayMode() - SUCCESS');
      
      const settingsSummary = settingsHook.getSettingsSummary();
      addTestResult(`✅ Settings Summary: ${settingsSummary.enabledInputTypes.join(', ')}`);
      
      // Test 2: Flashcard Hook
      addTestResult('🧪 Testing useFlashcard hook...');
      
      // Mock the service
      flashcardHook['controllerRef'].current['flashcardService'].getFlashcards = async () => mockFlashcards;
      
      await flashcardHook.loadFlashcards('colors');
      addTestResult('✅ useFlashcard.loadFlashcards() - SUCCESS');
      
      if (flashcardHook.currentFlashcard) {
        addTestResult(`✅ Current Flashcard: ${flashcardHook.currentFlashcard.hiragana} (${flashcardHook.currentFlashcard.english})`);
      }
      
      flashcardHook.nextFlashcard();
      addTestResult('✅ useFlashcard.nextFlashcard() - SUCCESS');
      
      flashcardHook.previousFlashcard();
      addTestResult('✅ useFlashcard.previousFlashcard() - SUCCESS');
      
      // Test 3: Answer Hook
      addTestResult('🧪 Testing useAnswer hook...');
      
      if (flashcardHook.currentFlashcard) {
        answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
        addTestResult('✅ useAnswer.setCurrentFlashcard() - SUCCESS');
        
        const validationResult = answerHook.validateAnswer('red');
        addTestResult(`✅ useAnswer.validateAnswer() - ${validationResult.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        
        await answerHook.submitAnswer('red');
        addTestResult('✅ useAnswer.submitAnswer() - SUCCESS');
        
        const feedback = answerHook.getAnswerFeedback();
        addTestResult(`✅ Answer Feedback: ${feedback.message}`);
      }
      
      // Test 4: Progress Hook
      addTestResult('🧪 Testing useProgress hook...');
      
      await progressHook.loadProgress('colors');
      addTestResult('✅ useProgress.loadProgress() - SUCCESS');
      
      const progress = progressHook.getProgress();
      if (progress) {
        addTestResult(`✅ Progress: ${progress.completedItems}/${progress.totalItems} items`);
      }
      
      const sessionStats = progressHook.getSessionStatistics();
      addTestResult(`✅ Session Stats: ${sessionStats.itemsCompleted} items completed`);
      
      // Test 5: Integration Test
      addTestResult('🧪 Testing hooks integration...');
      
      const answerResult = {
        id: 'test-answer-1',
        flashcardId: flashcardHook.currentFlashcard?.id || 'test-1',
        userAnswer: 'red',
        isCorrect: true,
        validationResult: { isCorrect: true, feedback: ['Correct!'] },
        timestamp: new Date(),
        attempts: 1,
        moduleName: 'colors',
        sessionId: 'test-session'
      };
      
      await progressHook.updateProgress(answerResult);
      addTestResult('✅ Progress updated with answer result');
      
      const updatedProgress = progressHook.getProgress();
      if (updatedProgress) {
        addTestResult(`✅ Updated Progress: ${updatedProgress.correctAnswers} correct answers`);
      }
      
      addTestResult('🎉 All hooks tests completed successfully!');
      setTestStatus('completed');
      
    } catch (error) {
      addTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestStatus('completed');
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim() || !flashcardHook.currentFlashcard) return;
    
    try {
      await answerHook.submitAnswer(userAnswer);
      const feedback = answerHook.getAnswerFeedback();
      addTestResult(`📝 Answer submitted: "${userAnswer}" - ${feedback.message}`);
      
      // Update progress
      const answerResult = {
        id: `answer-${Date.now()}`,
        flashcardId: flashcardHook.currentFlashcard.id,
        userAnswer,
        isCorrect: answerHook.isCurrentAnswerCorrect(),
        validationResult: answerHook.validateAnswer(userAnswer),
        timestamp: new Date(),
        attempts: 1,
        moduleName: 'colors',
        sessionId: 'test-session'
      };
      
      await progressHook.updateProgress(answerResult);
      addTestResult('📊 Progress updated');
      
      setUserAnswer('');
    } catch (error) {
      addTestResult(`❌ Answer submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePresetChange = (preset: 'beginner' | 'intermediate' | 'advanced' | 'custom') => {
    setSelectedPreset(preset);
    settingsHook.applyPreset(preset);
    addTestResult(`🎛️ Applied ${preset} preset`);
  };

  const resetTests = () => {
    setTestResults([]);
    setTestStatus('idle');
    setUserAnswer('');
    
    // Reset all hooks
    flashcardHook.reset();
    answerHook.reset();
    progressHook.reset();
    settingsHook.reset();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Sprint 8: Flashcard MVC Hooks Test
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Test Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">Test Controls</h2>
            
            <div className="space-y-3">
              <button
                onClick={runHooksTests}
                disabled={testStatus === 'testing'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testStatus === 'testing' ? 'Running Tests...' : 'Run Hooks Tests'}
              </button>
              
              <button
                onClick={resetTests}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Reset Tests
              </button>
            </div>
          </div>
          
          {/* Settings Presets */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Settings Presets</h3>
            
            <div className="space-y-2">
              {(['beginner', 'intermediate', 'advanced', 'custom'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                    selectedPreset === preset
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                  }`}
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Interactive Test */}
          {flashcardHook.currentFlashcard && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Interactive Test</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Current Flashcard:</p>
                  <p className="font-semibold text-lg">{flashcardHook.currentFlashcard.hiragana}</p>
                  <p className="text-gray-600">English: {flashcardHook.currentFlashcard.english}</p>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                  />
                  <button
                    onClick={handleAnswerSubmit}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Test Results */}
        <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Test Results</h2>
          
          <div className="bg-white rounded border max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No test results yet. Click "Run Hooks Tests" to start.</p>
            ) : (
              <div className="p-4 space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Hook Status */}
        <div className="lg:col-span-1 space-y-4">
          {/* Hook Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Hook Status</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">useFlashcard</span>
                <span className={`text-sm font-medium ${flashcardHook.hasFlashcards ? 'text-green-600' : 'text-gray-400'}`}>
                  {flashcardHook.hasFlashcards ? '✅ Active' : '⏳ Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">useAnswer</span>
                <span className={`text-sm font-medium ${answerHook.hasAnswerForCurrentFlashcard() ? 'text-green-600' : 'text-gray-400'}`}>
                  {answerHook.hasAnswerForCurrentFlashcard() ? '✅ Active' : '⏳ Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">useProgress</span>
                <span className={`text-sm font-medium ${progressHook.progress ? 'text-green-600' : 'text-gray-400'}`}>
                  {progressHook.progress ? '✅ Active' : '⏳ Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">useSettings</span>
                <span className={`text-sm font-medium ${settingsHook.hasSettings ? 'text-green-600' : 'text-gray-400'}`}>
                  {settingsHook.hasSettings ? '✅ Active' : '⏳ Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Hook State Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Hook State Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Index:</span>
                <span className="font-medium">{flashcardHook.currentIndex + 1}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">{flashcardHook.totalCount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Completion:</span>
                <span className="font-medium">
                  {flashcardHook.totalCount > 0 ? Math.round(((flashcardHook.currentIndex + 1) / flashcardHook.totalCount) * 100) : 0}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium">{progressHook.getAccuracy().toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Session Duration:</span>
                <span className="font-medium">{Math.round(progressHook.getSessionStatistics().sessionDuration / 1000)}s</span>
              </div>
            </div>
          </div>

          {/* Settings Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Settings Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Module:</span>
                <span className="ml-2 font-medium">{settingsHook.settingsSummary.moduleName}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Display Mode:</span>
                <span className="ml-2 font-medium">{settingsHook.settingsSummary.displayMode}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Practice Mode:</span>
                <span className="ml-2 font-medium">{settingsHook.settingsSummary.practiceMode}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Difficulty:</span>
                <span className="ml-2 font-medium">{settingsHook.settingsSummary.difficulty}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Enabled Types:</span>
                <div className="ml-2 text-xs text-gray-500">
                  {settingsHook.settingsSummary.enabledInputTypes.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HooksTestComponent;
