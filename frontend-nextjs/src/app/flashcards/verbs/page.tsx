'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  useFlashcard, 
  useAnswer, 
  useProgress, 
  useSettings 
} from '@/modules/flashcard/hooks';
import { 
  FlashcardDisplay,
  AnswerFeedback,
  FloatingFeedback,
  FeedbackDisplay,
  ProgressSection,
  ProgressBar
} from '@/modules/flashcard/views';
import { AnswerInput } from '@/components/flashcard/answer-input';
import { SettingsModal } from '@/components/flashcard/settings-modal';
import { HelpModal } from '@/components/flashcard/help-modal';
import { Statistics } from '@/components/flashcard/statistics';
import { ConjugationPractice } from '@/components/conjugation/conjugation-practice';
import { ConjugationSettings } from '@/components/conjugation/conjugation-settings';
import { ConjugationStats } from '@/components/conjugation/conjugation-stats';
import { NavigationHeader } from '@/components/navigation-header';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, HelpCircle } from 'lucide-react';
import { FlashcardItem, WordType } from '@/modules/flashcard/types/FlashcardTypes';
import { AnswerResult } from '@/modules/flashcard/types/AnswerTypes';
import { ValidationResult } from '@/lib/validation';

export default function VerbsPage() {
  const moduleName = 'verbs';
  
  // Initialize MVC hooks
  const flashcardHook = useFlashcard();
  const answerHook = useAnswer();
  const progressHook = useProgress();
  const settingsHook = useSettings();

  // UI state
  const [currentMode, setCurrentMode] = useState<'flashcard' | 'conjugation'>('flashcard');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showConjugationSettings, setShowConjugationSettings] = useState(false);
  const [selectedConjugationForm, setSelectedConjugationForm] = useState('polite');
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mock verbs data for comprehensive edge case testing
  const mockVerbs: FlashcardItem[] = [
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
    // Irregular verbs
    {
      id: 'verb-3',
      hiragana: 'くる',
      kanji: '来る',
      english: 'to come',
      type: WordType.VERB,
      difficulty: 'beginner',
      furigana: 'くる',
      romaji: 'kuru'
    },
    {
      id: 'verb-4',
      hiragana: 'する',
      kanji: 'する',
      english: 'to do',
      type: WordType.VERB,
      difficulty: 'beginner',
      furigana: 'する',
      romaji: 'suru'
    },
    // Verbs with special characters
    {
      id: 'verb-5',
      hiragana: 'みる',
      kanji: '見る',
      english: 'to see',
      type: WordType.VERB,
      difficulty: 'beginner',
      furigana: 'みる',
      romaji: 'miru'
    },
    // Verbs with long readings
    {
      id: 'verb-6',
      hiragana: 'べんきょうする',
      kanji: '勉強する',
      english: 'to study',
      type: WordType.VERB,
      difficulty: 'intermediate',
      furigana: 'べんきょうする',
      romaji: 'benkyou suru'
    },
    // Verbs with multiple meanings
    {
      id: 'verb-7',
      hiragana: 'はなす',
      kanji: '話す',
      english: 'to speak, to talk',
      type: WordType.VERB,
      difficulty: 'intermediate',
      furigana: 'はなす',
      romaji: 'hanasu'
    },
    // Godan verbs with special conjugations
    {
      id: 'verb-8',
      hiragana: 'かう',
      kanji: '買う',
      english: 'to buy',
      type: WordType.VERB,
      difficulty: 'beginner',
      furigana: 'かう',
      romaji: 'kau'
    },
    // Ichidan verbs
    {
      id: 'verb-9',
      hiragana: 'たべる',
      kanji: '食べる',
      english: 'to eat',
      type: WordType.VERB,
      difficulty: 'beginner',
      furigana: 'たべる',
      romaji: 'taberu'
    },
    // Verbs with complex furigana
    {
      id: 'verb-10',
      hiragana: 'おぼえる',
      kanji: '覚える',
      english: 'to remember',
      type: WordType.VERB,
      difficulty: 'intermediate',
      furigana: 'おぼえる',
      romaji: 'oboeru'
    }
  ];

  // Initialize the MVC architecture with timeout
  useEffect(() => {
    const initializeMVC = async () => {
      try {
        // Load settings for verbs module
        await settingsHook.loadSettings(moduleName);
        
        // Load flashcards
        await flashcardHook.loadFlashcards(moduleName);
        
        // Load progress
        await progressHook.loadProgress(moduleName);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing MVC architecture:', error);
        // Set to true even on error to show the page
        setIsInitialized(true);
      }
    };

    // Set a timeout to force initialization after 5 seconds
    const timeoutId = setTimeout(() => {
      console.log('MVC initialization timeout - forcing page load');
      setIsInitialized(true);
    }, 5000);

    initializeMVC().finally(() => {
      clearTimeout(timeoutId);
    });
  }, [moduleName]);

  // Remove mock data injection - use API data directly
  // useEffect(() => {
  //   // Access controller through the hook's internal reference
  //   const controller = (flashcardHook as any).controllerRef?.current;
  //   if (controller?.flashcardService) {
  //     controller.flashcardService.getFlashcards = async () => mockVerbs;
  //   }
  // }, []);

  const handleAnswerSubmit = useCallback(async (userAnswer: string | Record<string, string>) => {
    if (!flashcardHook.currentFlashcard) return;

    try {
      // Submit answer using MVC architecture
      const answerString = typeof userAnswer === 'string' ? userAnswer : 
        `${userAnswer.hiragana || ''} / ${userAnswer.english || ''}`.replace(/ \/ $/, '');
      
      // Set current flashcard before submitting answer
      answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
      
      // Submit answer and wait for completion
      await answerHook.submitAnswer(answerString);
      
      // Get validation result after submission
      const validationResult = answerHook.validationResult;
      const isCorrect = answerHook.isCurrentAnswerCorrect();
      
      // Create answer result for progress tracking
      const answerResult: AnswerResult = {
        id: `answer-${Date.now()}`,
        flashcardId: flashcardHook.currentFlashcard.id,
        userAnswer: answerString,
        isCorrect: isCorrect,
        validationResult: validationResult || {
          isCorrect: false,
          results: [false],
          feedbackColor: 'text-red-500',
          matchedType: undefined,
          convertedAnswer: undefined
        },
        timestamp: new Date(),
        attempts: answerHook.getAnswerAttemptsForCurrentFlashcard(),
        moduleName: moduleName,
        sessionId: answerHook.sessionId
      };

      // Update progress
      await progressHook.updateProgress(answerResult);
      
      // Show feedback immediately after validation
      setShowFloatingFeedback(true);
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Show error feedback even on failure
      setShowFloatingFeedback(true);
    }
  }, [flashcardHook.currentFlashcard, answerHook, progressHook, moduleName]);

  const handleNextFlashcard = useCallback(() => {
    flashcardHook.nextFlashcard();
    if (flashcardHook.currentFlashcard) {
      answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
      answerHook.clearAnswer();
    }
    setShowFloatingFeedback(false);
  }, [flashcardHook, answerHook]);

  const handlePreviousFlashcard = useCallback(() => {
    flashcardHook.previousFlashcard();
    if (flashcardHook.currentFlashcard) {
      answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
      answerHook.clearAnswer();
    }
    setShowFloatingFeedback(false);
  }, [flashcardHook, answerHook]);

  const handleSkipFlashcard = useCallback(() => {
    flashcardHook.skipFlashcard();
    if (flashcardHook.currentFlashcard) {
      answerHook.setCurrentFlashcard(flashcardHook.currentFlashcard);
      answerHook.clearAnswer();
    }
    setShowFloatingFeedback(false);
  }, [flashcardHook, answerHook]);

  const handleFloatingFeedbackClose = useCallback(() => {
    setShowFloatingFeedback(false);
    handleNextFlashcard();
  }, [handleNextFlashcard]);

  if (!isInitialized || flashcardHook.isLoading || settingsHook.isLoading || progressHook.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Loading verbs module...</p>
        </div>
      </div>
    );
  }

  if (flashcardHook.error || settingsHook.error || progressHook.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <p className="text-primary-foreground mb-4">Error loading verbs module</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!flashcardHook.currentFlashcard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <p className="text-primary-foreground">No verbs available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      {/* Navigation Header */}
      <NavigationHeader currentPage={`/flashcards/${moduleName}`} />
      
      {/* Page Content */}
      <div className="pt-16">
        {/* Module Header */}
        <div className="relative z-10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary-foreground capitalize">
              Verbs Flashcards
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMode(prev => prev === 'flashcard' ? 'conjugation' : 'flashcard')}
              className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
            >
              {currentMode === 'flashcard' ? 'Switch to Conjugation' : 'Switch to Flashcards'}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {currentMode === 'conjugation' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConjugationSettings(true)}
                className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Conjugation Settings
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(true)}
              className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
            >
              Statistics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
            {currentMode === 'flashcard' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
          {currentMode === 'flashcard' ? (
            <div className="w-full max-w-4xl">
              {/* Progress Section */}
              <ProgressSection
                currentItem={flashcardHook.currentIndex + 1}
                totalItems={flashcardHook.totalCount}
                progress={progressHook.progress || undefined}
                metrics={progressHook.metrics || undefined}
                settings={settingsHook.settings!}
                moduleName={moduleName}
                showMetrics={true}
                showInsights={true}
              />

              {/* Flashcard Display */}
              <FlashcardDisplay
                flashcard={flashcardHook.currentFlashcard}
                settings={settingsHook.settings!}
                isUserInteraction={answerHook.isSubmitting}
                mode={currentMode}
                onNext={handleNextFlashcard}
                onPrevious={handlePreviousFlashcard}
                onSkip={handleSkipFlashcard}
                disabled={answerHook.isSubmitting}
                canGoPrevious={flashcardHook.currentIndex > 0}
                canGoNext={flashcardHook.currentIndex < flashcardHook.totalCount - 1}
              />

              {/* Answer Input */}
              <AnswerInput
                onSubmit={handleAnswerSubmit}
                onAdvance={handleNextFlashcard}
                disabled={answerHook.isSubmitting}
                settings={settingsHook.settings!}
                isCorrect={answerHook.isCurrentAnswerCorrect()}
                currentItem={flashcardHook.currentFlashcard}
                lastAnswer={answerHook.userAnswer}
                lastMatchedType={answerHook.validationResult?.matchedType}
                lastConvertedAnswer={answerHook.validationResult?.convertedAnswer}
                moduleName={moduleName}
                enableServerValidation={false}
                enableRealtimeFeedback={false}
              />

              {/* Answer Feedback */}
              {answerHook.showFeedback && answerHook.validationResult && (
                <FeedbackDisplay
                  feedbackData={{
                    item: flashcardHook.currentFlashcard,
                    userAnswer: answerHook.userAnswer,
                    isCorrect: answerHook.isCurrentAnswerCorrect(),
                    validationResult: answerHook.validationResult
                  }}
                  settings={settingsHook.settings!}
                  onFeedbackClose={() => answerHook.clearAnswer()}
                  displayMode="both"
                  showFloating={true}
                  floatingPosition="top"
                />
              )}
            </div>
          ) : (
            /* Conjugation Practice Mode */
            <ConjugationPractice
              moduleName={moduleName}
              initialForm={selectedConjugationForm}
              onComplete={() => setCurrentMode('flashcard')}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          moduleName={moduleName}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showHelp && (
        <HelpModal
          moduleName={moduleName}
          currentItemId={flashcardHook.currentIndex + 1}
          onClose={() => setShowHelp(false)}
        />
      )}
      
      {showStats && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStats(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              {currentMode === 'conjugation' ? (
                <ConjugationStats moduleName={moduleName} />
              ) : (
                <Statistics
                  moduleName={moduleName}
                  onClose={() => setShowStats(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conjugation Settings Modal */}
      {showConjugationSettings && (
        <ConjugationSettings
          isOpen={showConjugationSettings}
          onClose={() => setShowConjugationSettings(false)}
          selectedForm={selectedConjugationForm}
          onFormChange={setSelectedConjugationForm}
          moduleName={moduleName}
        />
      )}

      {/* Floating Feedback Modal */}
      {showFloatingFeedback && answerHook.validationResult && (
        <FloatingFeedback
          validationResult={answerHook.validationResult}
          isVisible={showFloatingFeedback}
          onClose={handleFloatingFeedbackClose}
          position="top"
          autoHide={true}
          autoHideDelay={3000}
        />
      )}
    </div>
  );
}
