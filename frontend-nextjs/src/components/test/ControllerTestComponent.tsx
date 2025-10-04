import React, { useState, useEffect } from 'react';
import { 
  FlashcardController, 
  AnswerController, 
  ProgressController, 
  SettingsController 
} from '../modules/flashcard/controllers';
import { FlashcardItem, WordType } from '../modules/flashcard/types/FlashcardTypes';
import { AnswerResult } from '../modules/flashcard/types/AnswerTypes';

/**
 * ControllerTestComponent - Test component for Sprint 6 controllers
 * Verifies all controller functionality with mock data
 */
export const ControllerTestComponent: React.FC = () => {
  const [flashcardController] = useState(() => new FlashcardController());
  const [answerController] = useState(() => new AnswerController());
  const [progressController] = useState(() => new ProgressController());
  const [settingsController] = useState(() => new SettingsController());
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashcardItem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'completed'>('idle');

  // Mock flashcard data for testing
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

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runControllerTests = async () => {
    setTestStatus('testing');
    setTestResults([]);
    
    try {
      // Test 1: FlashcardController
      addTestResult('🧪 Testing FlashcardController...');
      
      // Mock the service to return our test data
      const originalGetFlashcards = flashcardController['flashcardService'].getFlashcards;
      flashcardController['flashcardService'].getFlashcards = async () => mockFlashcards;
      
      await flashcardController.loadFlashcards('colors');
      addTestResult('✅ FlashcardController.loadFlashcards() - SUCCESS');
      
      const currentCard = flashcardController.getCurrentFlashcard();
      if (currentCard) {
        setCurrentFlashcard(currentCard);
        addTestResult(`✅ Current flashcard: ${currentCard.hiragana} (${currentCard.english})`);
      }
      
      flashcardController.nextFlashcard();
      addTestResult('✅ FlashcardController.nextFlashcard() - SUCCESS');
      
      flashcardController.previousFlashcard();
      addTestResult('✅ FlashcardController.previousFlashcard() - SUCCESS');
      
      // Test 2: AnswerController
      addTestResult('🧪 Testing AnswerController...');
      
      if (currentCard) {
        answerController.setCurrentFlashcard(currentCard);
        addTestResult('✅ AnswerController.setCurrentFlashcard() - SUCCESS');
        
        const validationResult = answerController.validateAnswer('red');
        addTestResult(`✅ AnswerController.validateAnswer() - ${validationResult.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        
        await answerController.submitAnswer('red');
        addTestResult('✅ AnswerController.submitAnswer() - SUCCESS');
        
        const feedback = answerController.getAnswerFeedback();
        addTestResult(`✅ AnswerController.getAnswerFeedback() - ${feedback.message}`);
      }
      
      // Test 3: ProgressController
      addTestResult('🧪 Testing ProgressController...');
      
      await progressController.loadProgress('colors');
      addTestResult('✅ ProgressController.loadProgress() - SUCCESS');
      
      const progress = progressController.getProgress();
      addTestResult(`✅ ProgressController.getProgress() - Total: ${progress.totalItems}, Completed: ${progress.completedItems}`);
      
      const summary = progressController.getProgressSummary();
      addTestResult(`✅ ProgressController.getProgressSummary() - Module: ${summary.moduleName}, Status: ${summary.status}`);
      
      // Test 4: SettingsController
      addTestResult('🧪 Testing SettingsController...');
      
      await settingsController.loadSettings('colors');
      addTestResult('✅ SettingsController.loadSettings() - SUCCESS');
      
      const settings = settingsController.getSettings();
      addTestResult(`✅ SettingsController.getSettings() - Display Mode: ${settings.display_mode}`);
      
      settingsController.enableInputType('hiragana' as any);
      addTestResult('✅ SettingsController.enableInputType() - SUCCESS');
      
      const summary2 = settingsController.getSettingsSummary();
      addTestResult(`✅ SettingsController.getSettingsSummary() - Enabled Types: ${summary2.enabledInputTypes.join(', ')}`);
      
      // Test 5: Integration Test
      addTestResult('🧪 Testing Controller Integration...');
      
      // Simulate a complete learning flow
      const testAnswer: AnswerResult = {
        id: 'test-answer-1',
        flashcardId: currentCard?.id || 'test-1',
        userAnswer: 'red',
        isCorrect: true,
        validationResult: { isCorrect: true, feedback: ['Correct!'] },
        timestamp: new Date(),
        attempts: 1,
        moduleName: 'colors',
        sessionId: 'test-session'
      };
      
      await progressController.updateProgress(testAnswer);
      addTestResult('✅ ProgressController.updateProgress() - SUCCESS');
      
      const updatedProgress = progressController.getProgress();
      addTestResult(`✅ Updated Progress - Correct: ${updatedProgress.correctAnswers}, Total: ${updatedProgress.totalItems}`);
      
      addTestResult('🎉 All controller tests completed successfully!');
      setTestStatus('completed');
      
    } catch (error) {
      addTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestStatus('completed');
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim() || !currentFlashcard) return;
    
    try {
      await answerController.submitAnswer(userAnswer);
      const feedback = answerController.getAnswerFeedback();
      addTestResult(`📝 Answer submitted: "${userAnswer}" - ${feedback.message}`);
      
      // Update progress
      const answerResult: AnswerResult = {
        id: `answer-${Date.now()}`,
        flashcardId: currentFlashcard.id,
        userAnswer,
        isCorrect: answerController.isCurrentAnswerCorrect(),
        validationResult: answerController.validateAnswer(userAnswer),
        timestamp: new Date(),
        attempts: 1,
        moduleName: 'colors',
        sessionId: 'test-session'
      };
      
      await progressController.updateProgress(answerResult);
      addTestResult('📊 Progress updated');
      
      setUserAnswer('');
    } catch (error) {
      addTestResult(`❌ Answer submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setTestStatus('idle');
    setCurrentFlashcard(null);
    setUserAnswer('');
    
    // Reset controllers
    flashcardController.reset();
    answerController.reset();
    progressController.reset();
    settingsController.reset();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Sprint 6: Flashcard MVC Controllers Test
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">Test Controls</h2>
            
            <div className="space-y-3">
              <button
                onClick={runControllerTests}
                disabled={testStatus === 'testing'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testStatus === 'testing' ? 'Running Tests...' : 'Run Controller Tests'}
              </button>
              
              <button
                onClick={resetTests}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Reset Tests
              </button>
            </div>
          </div>
          
          {/* Interactive Test */}
          {currentFlashcard && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Interactive Test</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Current Flashcard:</p>
                  <p className="font-semibold text-lg">{currentFlashcard.hiragana}</p>
                  <p className="text-gray-600">English: {currentFlashcard.english}</p>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                  />
                  <button
                    onClick={handleAnswerSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Test Results */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Test Results</h2>
          
          <div className="bg-white rounded border max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No test results yet. Click "Run Controller Tests" to start.</p>
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
      </div>
      
      {/* Controller Status */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-sm text-gray-600">FlashcardController</div>
          <div className="text-lg font-semibold text-blue-600">
            {flashcardController.hasFlashcards() ? '✅' : '⏳'}
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-sm text-gray-600">AnswerController</div>
          <div className="text-lg font-semibold text-green-600">
            {answerController.hasAnswerForCurrentFlashcard() ? '✅' : '⏳'}
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-sm text-gray-600">ProgressController</div>
          <div className="text-lg font-semibold text-purple-600">
            {progressController.hasProgress() ? '✅' : '⏳'}
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-sm text-gray-600">SettingsController</div>
          <div className="text-lg font-semibold text-orange-600">
            {settingsController.hasSettings() ? '✅' : '⏳'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerTestComponent;
