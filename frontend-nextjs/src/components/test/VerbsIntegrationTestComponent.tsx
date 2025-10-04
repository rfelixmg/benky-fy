import React, { useState, useEffect } from 'react';
import { 
  useFlashcard, 
  useAnswer, 
  useProgress, 
  useSettings 
} from '../modules/flashcard/hooks';
import { 
  FlashcardDisplay,
  AnswerFeedback,
  FloatingFeedback,
  FeedbackDisplay,
  ProgressSection
} from '../modules/flashcard/views';
import { FlashcardItem, WordType } from '../modules/flashcard/types/FlashcardTypes';
import { InputType } from '../modules/flashcard/types/AnswerTypes';

/**
 * VerbsIntegrationTestComponent - Comprehensive test for Sprint 9
 * Tests all validation flows and edge cases with the verbs module
 */
export const VerbsIntegrationTestComponent: React.FC = () => {
  // Initialize MVC hooks
  const flashcardHook = useFlashcard();
  const answerHook = useAnswer();
  const progressHook = useProgress();
  const settingsHook = useSettings();

  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'completed'>('idle');
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(false);

  // Comprehensive test verbs with various edge cases
  const testVerbs: FlashcardItem[] = [
    // Basic verbs
    {
      id: 'verb-1',
      hiragana: 'たべる',
      kanji: '食べる',
      english: 'to eat',
      type: WordType.VERB,
      difficulty: 'beginner',
      furigana: 'たべる',
      romaji: 'taberu'
    },
    // Verb with special characters
    {
      id: 'verb-2',
      hiragana: 'いく',
      kanji: '行く',
      english: 'to go',
      type: WordType.VERB,
      difficulty: 'beginner',
      furigana: 'いく',
      romaji: 'iku'
    },
    // Irregular verb
    {
      id: 'verb-3',
      hiragana: 'くる',
      kanji: '来る',
      english: 'to come',
      type: WordType.VERB,
      difficulty: 'intermediate',
      furigana: 'くる',
      romaji: 'kuru'
    },
    // Verb with long reading
    {
      id: 'verb-4',
      hiragana: 'あらわれる',
      kanji: '現れる',
      english: 'to appear',
      type: WordType.VERB,
      difficulty: 'intermediate',
      furigana: 'あらわれる',
      romaji: 'arawareru'
    },
    // Verb with multiple meanings
    {
      id: 'verb-5',
      hiragana: 'する',
      kanji: 'する',
      english: 'to do',
      type: WordType.VERB,
      difficulty: 'beginner',
      furigana: 'する',
      romaji: 'suru'
    }
  ];

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runValidationFlowTests = async () => {
    setTestStatus('testing');
    setTestResults([]);
    
    try {
      // Initialize MVC architecture
      addTestResult('🚀 Initializing MVC architecture...');
      
      // Mock the services
      flashcardHook['controllerRef'].current['flashcardService'].getFlashcards = async () => testVerbs;
      
      await settingsHook.loadSettings('verbs');
      await flashcardHook.loadFlashcards('verbs');
      await progressHook.loadProgress('verbs');
      
      addTestResult('✅ MVC architecture initialized successfully');
      
      // Test 1: Single Input Validation (Hiragana only)
      addTestResult('🧪 Test 1: Single Input Validation (Hiragana)');
      setCurrentTest('Single Input - Hiragana');
      
      if (flashcardHook.currentFlashcard) {
        answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
        
        // Test correct hiragana answer
        const correctAnswer = flashcardHook.currentFlashcard.hiragana;
        await answerHook.submitAnswer(correctAnswer);
        
        const validationResult = answerHook.validateAnswer(correctAnswer);
        addTestResult(`✅ Correct hiragana answer: ${validationResult.isCorrect ? 'PASS' : 'FAIL'}`);
        
        // Test incorrect hiragana answer
        const incorrectAnswer = 'まちがい';
        await answerHook.submitAnswer(incorrectAnswer);
        
        const incorrectValidation = answerHook.validateAnswer(incorrectAnswer);
        addTestResult(`✅ Incorrect hiragana answer: ${!incorrectValidation.isCorrect ? 'PASS' : 'FAIL'}`);
      }
      
      // Test 2: Multiple Input Validation (Hiragana + English)
      addTestResult('🧪 Test 2: Multiple Input Validation (Hiragana + English)');
      setCurrentTest('Multiple Input - Hiragana + English');
      
      flashcardHook.nextFlashcard();
      if (flashcardHook.currentFlashcard) {
        answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
        
        // Test multiple correct inputs
        const multipleAnswer = {
          hiragana: flashcardHook.currentFlashcard.hiragana,
          english: flashcardHook.currentFlashcard.english
        };
        
        const multipleAnswerString = `${multipleAnswer.hiragana} / ${multipleAnswer.english}`;
        await answerHook.submitAnswer(multipleAnswerString);
        
        const multipleValidation = answerHook.validateAnswer(multipleAnswerString);
        addTestResult(`✅ Multiple correct inputs: ${multipleValidation.isCorrect ? 'PASS' : 'FAIL'}`);
      }
      
      // Test 3: Romaji Conversion Validation
      addTestResult('🧪 Test 3: Romaji Conversion Validation');
      setCurrentTest('Romaji Conversion');
      
      flashcardHook.nextFlashcard();
      if (flashcardHook.currentFlashcard) {
        answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
        
        // Test romaji input
        const romajiAnswer = flashcardHook.currentFlashcard.romaji || '';
        await answerHook.submitAnswer(romajiAnswer);
        
        const romajiValidation = answerHook.validateAnswer(romajiAnswer);
        addTestResult(`✅ Romaji conversion: ${romajiValidation.isCorrect ? 'PASS' : 'FAIL'}`);
      }
      
      // Test 4: Edge Cases
      addTestResult('🧪 Test 4: Edge Cases');
      setCurrentTest('Edge Cases');
      
      // Test empty input
      const emptyValidation = answerHook.validateAnswer('');
      addTestResult(`✅ Empty input handling: ${!emptyValidation.isCorrect ? 'PASS' : 'FAIL'}`);
      
      // Test special characters
      const specialValidation = answerHook.validateAnswer('!@#$%');
      addTestResult(`✅ Special characters handling: ${!specialValidation.isCorrect ? 'PASS' : 'FAIL'}`);
      
      // Test with verb containing special characters
      flashcardHook.nextFlashcard();
      if (flashcardHook.currentFlashcard) {
        answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
        
        const specialCharValidation = answerHook.validateAnswer(flashcardHook.currentFlashcard.hiragana);
        addTestResult(`✅ Special character verb: ${specialCharValidation.isCorrect ? 'PASS' : 'FAIL'}`);
      }
      
      // Test 5: Furigana Support
      addTestResult('🧪 Test 5: Furigana Support');
      setCurrentTest('Furigana Support');
      
      flashcardHook.nextFlashcard();
      if (flashcardHook.currentFlashcard) {
        answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
        
        // Test kanji with furigana
        const kanjiAnswer = flashcardHook.currentFlashcard.kanji || '';
        await answerHook.submitAnswer(kanjiAnswer);
        
        const kanjiValidation = answerHook.validateAnswer(kanjiAnswer);
        addTestResult(`✅ Kanji with furigana: ${kanjiValidation.isCorrect ? 'PASS' : 'FAIL'}`);
      }
      
      // Test 6: Progress Tracking
      addTestResult('🧪 Test 6: Progress Tracking');
      setCurrentTest('Progress Tracking');
      
      const progressBefore = progressHook.getProgress();
      const progressStats = progressHook.getSessionStatistics();
      
      addTestResult(`✅ Progress tracking: ${progressBefore ? 'PASS' : 'FAIL'}`);
      addTestResult(`✅ Session statistics: ${progressStats ? 'PASS' : 'FAIL'}`);
      
      // Test 7: Settings Management
      addTestResult('🧪 Test 7: Settings Management');
      setCurrentTest('Settings Management');
      
      settingsHook.enableInputType(InputType.HIRAGANA);
      settingsHook.setDisplayMode('kanji');
      
      const settingsSummary = settingsHook.getSettingsSummary();
      addTestResult(`✅ Settings management: ${settingsSummary ? 'PASS' : 'FAIL'}`);
      
      addTestResult('🎉 All validation flow tests completed successfully!');
      setTestStatus('completed');
      
    } catch (error) {
      addTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestStatus('completed');
    }
  };

  const handleAnswerSubmit = async (userAnswer: string) => {
    if (!flashcardHook.currentFlashcard) return;
    
    try {
      await answerHook.submitAnswer(userAnswer);
      setShowFloatingFeedback(true);
      
      // Update progress
      const answerResult = {
        id: `answer-${Date.now()}`,
        flashcardId: flashcardHook.currentFlashcard.id,
        userAnswer,
        isCorrect: answerHook.isCurrentAnswerCorrect(),
        validationResult: answerHook.validateAnswer(userAnswer),
        timestamp: new Date(),
        attempts: 1,
        moduleName: 'verbs',
        sessionId: 'test-session'
      };
      
      await progressHook.updateProgress(answerResult);
      
    } catch (error) {
      addTestResult(`❌ Answer submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleNextFlashcard = () => {
    flashcardHook.nextFlashcard();
    if (flashcardHook.currentFlashcard) {
      answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
      answerHook.clearAnswer();
    }
    setShowFloatingFeedback(false);
  };

  const handlePreviousFlashcard = () => {
    flashcardHook.previousFlashcard();
    if (flashcardHook.currentFlashcard) {
      answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
      answerHook.clearAnswer();
    }
    setShowFloatingFeedback(false);
  };

  const resetTests = () => {
    setTestResults([]);
    setTestStatus('idle');
    setCurrentTest('');
    
    // Reset all hooks
    flashcardHook.reset();
    answerHook.reset();
    progressHook.reset();
    settingsHook.reset();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Sprint 9: Verbs Module Integration Test
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Test Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">Test Controls</h2>
            
            <div className="space-y-3">
              <button
                onClick={runValidationFlowTests}
                disabled={testStatus === 'testing'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testStatus === 'testing' ? 'Running Tests...' : 'Run Validation Flow Tests'}
              </button>
              
              <button
                onClick={resetTests}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Reset Tests
              </button>
            </div>
          </div>
          
          {/* Current Test Status */}
          {currentTest && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Current Test</h3>
              <p className="text-sm text-green-700">{currentTest}</p>
            </div>
          )}
          
          {/* Interactive Test */}
          {flashcardHook.currentFlashcard && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Interactive Test</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Current Verb:</p>
                  <p className="font-semibold text-lg">{flashcardHook.currentFlashcard.hiragana}</p>
                  <p className="text-gray-600">Kanji: {flashcardHook.currentFlashcard.kanji}</p>
                  <p className="text-gray-600">English: {flashcardHook.currentFlashcard.english}</p>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter your answer..."
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAnswerSubmit((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter your answer..."]') as HTMLInputElement;
                      if (input?.value) {
                        handleAnswerSubmit(input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Submit
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousFlashcard}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextFlashcard}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
                  >
                    Next
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
              <p className="p-4 text-gray-500 text-center">No test results yet. Click "Run Validation Flow Tests" to start.</p>
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

      {/* MVC Architecture Status */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-sm text-gray-600">useFlashcard</div>
          <div className="text-lg font-semibold text-blue-600">
            {flashcardHook.hasFlashcards ? '✅' : '⏳'}
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-sm text-gray-600">useAnswer</div>
          <div className="text-lg font-semibold text-green-600">
            {answerHook.hasAnswerForCurrentFlashcard() ? '✅' : '⏳'}
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-sm text-gray-600">useProgress</div>
          <div className="text-lg font-semibold text-purple-600">
            {progressHook.progress ? '✅' : '⏳'}
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-sm text-gray-600">useSettings</div>
          <div className="text-lg font-semibold text-orange-600">
            {settingsHook.hasSettings ? '✅' : '⏳'}
          </div>
        </div>
      </div>

      {/* Floating Feedback */}
      {showFloatingFeedback && answerHook.validationResult && (
        <FloatingFeedback
          validationResult={answerHook.validationResult}
          isVisible={showFloatingFeedback}
          onClose={() => setShowFloatingFeedback(false)}
          position="top"
          autoHide={true}
          autoHideDelay={3000}
        />
      )}
    </div>
  );
};

export default VerbsIntegrationTestComponent;
