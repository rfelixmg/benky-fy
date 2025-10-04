import React, { useState, useEffect } from 'react';
import { 
  FlashcardDisplay,
  AnswerFeedback,
  FloatingFeedback,
  FeedbackDisplay,
  ProgressSection,
  ProgressBar
} from '../modules/flashcard/views';
import { 
  FlashcardController, 
  AnswerController, 
  ProgressController, 
  SettingsController 
} from '../modules/flashcard/controllers';
import { FlashcardItem, WordType } from '../modules/flashcard/types/FlashcardTypes';
import { ValidationResult } from '@/lib/validation';

/**
 * ViewTestComponent - Test component for Sprint 7 views
 * Demonstrates the new MVC view architecture with controllers
 */
export const ViewTestComponent: React.FC = () => {
  const [flashcardController] = useState(() => new FlashcardController());
  const [answerController] = useState(() => new AnswerController());
  const [progressController] = useState(() => new ProgressController());
  const [settingsController] = useState(() => new SettingsController());
  
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashcardItem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
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

  const mockProgress = {
    id: 'progress-1',
    moduleName: 'colors',
    totalItems: 3,
    completedItems: 1,
    correctAnswers: 1,
    incorrectAnswers: 0,
    accuracy: 100,
    lastUpdated: new Date(),
    createdAt: new Date(),
    status: 'in_progress' as any,
    streakDays: 3,
    totalTimeSpent: 120000
  };

  const mockMetrics = {
    accuracy: 100,
    completionRate: 33.3,
    averageAttempts: 1.2,
    timePerItem: 120000,
    streakDays: 3,
    totalTimeSpent: 120000,
    improvementRate: 15.5,
    difficultyDistribution: { beginner: 2, intermediate: 1, advanced: 0 },
    mistakePatterns: []
  };

  useEffect(() => {
    initializeControllers();
  }, []);

  const initializeControllers = async () => {
    try {
      // Mock the services to return our test data
      flashcardController['flashcardService'].getFlashcards = async () => mockFlashcards;
      
      await flashcardController.loadFlashcards('colors');
      await progressController.loadProgress('colors');
      await settingsController.loadSettings('colors');
      
      const currentCard = flashcardController.getCurrentFlashcard();
      if (currentCard) {
        setCurrentFlashcard(currentCard);
        answerController.setCurrentFlashcard(currentCard);
      }
      
      setTestStatus('completed');
    } catch (error) {
      console.error('Error initializing controllers:', error);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim() || !currentFlashcard) return;
    
    try {
      await answerController.submitAnswer(userAnswer);
      const feedback = answerController.getAnswerFeedback();
      
      const result = answerController.validateAnswer(userAnswer);
      setValidationResult(result);
      
      setFeedbackData({
        item: currentFlashcard,
        userAnswer,
        isCorrect: result.isCorrect,
        validationResult: result
      });
      
      setShowFloatingFeedback(true);
      
      // Update progress
      const answerResult = {
        id: `answer-${Date.now()}`,
        flashcardId: currentFlashcard.id,
        userAnswer,
        isCorrect: result.isCorrect,
        validationResult: result,
        timestamp: new Date(),
        attempts: 1,
        moduleName: 'colors',
        sessionId: 'test-session'
      };
      
      await progressController.updateProgress(answerResult);
      
      setUserAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNext = () => {
    flashcardController.nextFlashcard();
    const nextCard = flashcardController.getCurrentFlashcard();
    if (nextCard) {
      setCurrentFlashcard(nextCard);
      answerController.setCurrentFlashcard(nextCard);
      setFeedbackData(null);
      setShowFloatingFeedback(false);
    }
  };

  const handlePrevious = () => {
    flashcardController.previousFlashcard();
    const prevCard = flashcardController.getCurrentFlashcard();
    if (prevCard) {
      setCurrentFlashcard(prevCard);
      answerController.setCurrentFlashcard(prevCard);
      setFeedbackData(null);
      setShowFloatingFeedback(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Sprint 7: Flashcard MVC Views Test
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Flashcard Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Section */}
          <ProgressSection
            currentItem={progressController.getCurrentIndex() + 1}
            totalItems={flashcardController.getTotalCount()}
            progress={mockProgress as any}
            metrics={mockMetrics as any}
            settings={mockSettings as any}
            moduleName="colors"
            showMetrics={true}
            showInsights={true}
          />

          {/* Flashcard Display */}
          {currentFlashcard && (
            <FlashcardDisplay
              flashcard={currentFlashcard}
              settings={mockSettings as any}
              isUserInteraction={false}
              mode="flashcard"
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSkip={handleSkip}
              disabled={false}
              canGoPrevious={flashcardController.getCurrentIndex() > 0}
              canGoNext={flashcardController.getCurrentIndex() < flashcardController.getTotalCount() - 1}
            />
          )}

          {/* Answer Input */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Answer Input</h3>
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Feedback Display */}
          {feedbackData && (
            <FeedbackDisplay
              feedbackData={feedbackData}
              settings={mockSettings as any}
              onFeedbackClose={() => setFeedbackData(null)}
              displayMode="both"
              showFloating={true}
              floatingPosition="top"
            />
          )}
        </div>

        {/* Right Column - Controller Status */}
        <div className="space-y-6">
          {/* Controller Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Controller Status</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">FlashcardController</span>
                <span className={`text-sm font-medium ${flashcardController.hasFlashcards() ? 'text-green-600' : 'text-gray-400'}`}>
                  {flashcardController.hasFlashcards() ? '✅ Active' : '⏳ Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AnswerController</span>
                <span className={`text-sm font-medium ${answerController.hasAnswerForCurrentFlashcard() ? 'text-green-600' : 'text-gray-400'}`}>
                  {answerController.hasAnswerForCurrentFlashcard() ? '✅ Active' : '⏳ Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ProgressController</span>
                <span className={`text-sm font-medium ${progressController.hasProgress() ? 'text-green-600' : 'text-gray-400'}`}>
                  {progressController.hasProgress() ? '✅ Active' : '⏳ Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SettingsController</span>
                <span className={`text-sm font-medium ${settingsController.hasSettings() ? 'text-green-600' : 'text-gray-400'}`}>
                  {settingsController.hasSettings() ? '✅ Active' : '⏳ Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Progress Metrics</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Index:</span>
                <span className="text-sm font-medium">{flashcardController.getCurrentIndex() + 1}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="text-sm font-medium">{flashcardController.getTotalCount()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion:</span>
                <span className="text-sm font-medium">
                  {Math.round(((flashcardController.getCurrentIndex() + 1) / flashcardController.getTotalCount()) * 100)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Accuracy:</span>
                <span className="text-sm font-medium">{mockProgress.accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Individual Progress Bars */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Progress Bars</h3>
            
            <div className="space-y-4">
              <div>
                <ProgressBar
                  progress={flashcardController.getCurrentIndex() + 1}
                  total={flashcardController.getTotalCount()}
                  showPercentage={true}
                  color="from-blue-500 to-cyan-500"
                  size="md"
                  label="Overall Progress"
                />
              </div>
              
              <div>
                <ProgressBar
                  progress={mockProgress.correctAnswers}
                  total={mockProgress.correctAnswers + mockProgress.incorrectAnswers}
                  showPercentage={true}
                  color="from-green-500 to-emerald-500"
                  size="sm"
                  label="Accuracy"
                />
              </div>
              
              <div>
                <ProgressBar
                  progress={mockProgress.streakDays}
                  total={7}
                  showPercentage={true}
                  color="from-yellow-500 to-orange-500"
                  size="sm"
                  label="Weekly Streak"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Feedback */}
      {showFloatingFeedback && validationResult && (
        <FloatingFeedback
          validationResult={validationResult}
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

export default ViewTestComponent;
