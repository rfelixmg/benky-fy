'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useWordsData, useRandomWord, validateAnswer, useTrackAnswer, AnswerResult } from '@/lib/hooks';
import { useSettingsStore } from '@/lib/settings-store';
import { FlashcardDisplay } from '@/components/flashcard/flashcard-display';
import { AnswerInput } from '@/components/flashcard/answer-input';
import { ProgressSection } from '@/components/flashcard/progress-section';
import { SettingsModal } from '@/components/flashcard/settings-modal';
import { HelpModal } from '@/components/flashcard/help-modal';
import { Statistics } from '@/components/flashcard/statistics';
import { ConjugationPractice } from '@/components/conjugation/conjugation-practice';
import { ConjugationSettings } from '@/components/conjugation/conjugation-settings';
import { ConjugationStats } from '@/components/conjugation/conjugation-stats';
import { NavigationHeader } from '@/components/navigation-header';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, HelpCircle } from 'lucide-react';

export default function FlashcardPage() {
  const params = useParams();
  const moduleName = params?.module as string;
  
  const [currentItemId, setCurrentItemId] = useState(1);
  const [isUserInteraction, setIsUserInteraction] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [currentMode, setCurrentMode] = useState<'flashcard' | 'conjugation'>('flashcard');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showConjugationSettings, setShowConjugationSettings] = useState(false);
  const [selectedConjugationForm, setSelectedConjugationForm] = useState('polite');
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lastAnswer, setLastAnswer] = useState('');
  const [lastMatchedType, setLastMatchedType] = useState<string | undefined>();
  const [lastConvertedAnswer, setLastConvertedAnswer] = useState<string | undefined>();
  const [testedWord, setTestedWord] = useState<any>(null); // Store the word being tested
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: wordsData, isLoading, error } = useWordsData(moduleName);
  const { data: randomWord, isLoading: isRandomLoading, error: randomError, refetch: refetchRandomWord } = useRandomWord(moduleName);
  const { getSettings } = useSettingsStore();
  const trackAnswerMutation = useTrackAnswer();
  
  const settings = getSettings(moduleName);

  // Unified navigation function for all modules
  const navigateToNext = useCallback(() => {
    if (moduleName === 'verbs') {
      refetchRandomWord();
    } else {
      setCurrentItemId(prev => prev + 1);
    }
  }, [moduleName, refetchRandomWord]);

  const navigateToPrevious = useCallback(() => {
    if (moduleName === 'verbs') {
      refetchRandomWord(); // For verbs, "previous" means new random word
    } else {
      setCurrentItemId(prev => Math.max(1, prev - 1));
    }
  }, [moduleName, refetchRandomWord]);

  // Manual advance function that clears timer and resets state
  const manualAdvance = useCallback(() => {
    // Clear any pending auto-advance timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    
    // Navigate to next item
    navigateToNext();
    
    // Reset state for next item
    setCurrentAttempts(0);
    setIsCorrect(false);
    setIsUserInteraction(false);
    setTestedWord(null);
  }, [navigateToNext]);

  // Use random word selection for verbs module, otherwise use traditional array-based selection
  const isVerbsModule = moduleName === 'verbs';
  const currentItem = isVerbsModule ? randomWord : wordsData?.find((item, index) => index === currentItemId - 1);
  const isLoadingData = isVerbsModule ? isRandomLoading : isLoading;
  
  // Use testedWord for validation/feedback, currentItem for display
  const itemForValidation = testedWord || currentItem;
  const dataError = isVerbsModule ? randomError : error;


  const handleAnswerSubmit = useCallback(async (userAnswer: string, serverValidationResult?: any) => {
    if (!currentItem) return;
    
    // Set the word being tested (only once per word)
    if (!testedWord) {
      setTestedWord(currentItem);
    }
    
    setIsUserInteraction(true);
    
    // Prepare correct answers for validation using the tested word
    const correctAnswers = {
      hiragana: itemForValidation.hiragana,
      katakana: itemForValidation.katakana,
      english: itemForValidation.english,
      kanji: itemForValidation.kanji,
    };
    
    // Use comprehensive validation (frontend fallback)
    const validationResult = validateAnswer(userAnswer, correctAnswers, settings);
    const answerIsCorrect = serverValidationResult?.is_correct ?? validationResult.isCorrect;
    const matchedType = validationResult.matchedType;
    const timerDuration = validationResult.timerDuration;
    // Store answer information for feedback
    setLastAnswer(userAnswer);
    setLastMatchedType(validationResult.matchedType);
    setLastConvertedAnswer(validationResult.convertedAnswer);
    
    // Update attempt counter
    const newAttempts = currentAttempts + 1;
    setCurrentAttempts(newAttempts);
    setIsCorrect(answerIsCorrect);
    
    // Track answer result for future database storage
    const answerResult: AnswerResult = {
      moduleName,
      itemId: itemForValidation.id,
      userAnswer,
      isCorrect: answerIsCorrect,
      matchedType: validationResult.matchedType,
      timerDuration: validationResult.timerDuration,
      attempts: newAttempts,
      timestamp: new Date().toISOString(),
      settings: {
        input_hiragana: settings.input_hiragana,
        input_katakana: settings.input_katakana,
        input_english: settings.input_english,
        input_kanji: settings.input_kanji,
        input_romaji: settings.input_romaji,
        display_mode: settings.display_mode,
        furigana_style: settings.furigana_style,
      }
    };
   
    // Handle feedback display - unified logic for all modules
    autoAdvanceTimerRef.current = setTimeout(() => {
      // Move to next item after feedback delay
      navigateToNext();
      
      // Reset state for next item
      setCurrentAttempts(0);
      setIsCorrect(false);
      setIsUserInteraction(false);
      setTestedWord(null);
      autoAdvanceTimerRef.current = null;
    }, timerDuration);
  }, [currentItem, currentAttempts, settings, navigateToNext]);



  useEffect(() => {
    if (wordsData && !isPageLoaded) {
      setIsPageLoaded(true);
    }
  }, [wordsData, isPageLoaded]);

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <p className="text-primary-foreground mb-4">Error loading flashcards</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <p className="text-primary-foreground">No flashcards available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      {/* Navigation Header */}
      <NavigationHeader currentPage={`/flashcards/${moduleName}`} />
      
      {/* Debug Component - Console Only */}
      
      {/* Page Content */}
      <div className="pt-16">
        {/* Module Header */}
        <div className="relative z-10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary-foreground capitalize">
              {moduleName} Flashcards
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
                currentItem={isVerbsModule ? 1 : currentItemId}
                totalItems={isVerbsModule ? 1 : wordsData?.length || 0}
                moduleName={moduleName}
              />

              {/* Flashcard Display */}
              <FlashcardDisplay
                item={currentItem}
                settings={settings}
                isUserInteraction={isUserInteraction}
                mode={currentMode}
              />

              {/* Answer Input */}
              <AnswerInput
                onSubmit={handleAnswerSubmit}
                onAdvance={manualAdvance}
                disabled={isUserInteraction}
                settings={settings}
                isCorrect={isCorrect}
                currentItem={itemForValidation}
                lastAnswer={lastAnswer}
                lastMatchedType={lastMatchedType}
                lastConvertedAnswer={lastConvertedAnswer}
                moduleName={moduleName}
                enableServerValidation={false}
                enableRealtimeFeedback={true}
              />

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
          currentItemId={currentItemId}
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
    </div>
  );
}