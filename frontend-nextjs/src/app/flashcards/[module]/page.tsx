'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useWordsData, validateAnswer, useTrackAnswer, AnswerResult } from '@/lib/hooks';
import { useSettingsStore } from '@/lib/settings-store';
import { FlashcardDisplay } from '@/components/flashcard/flashcard-display';
import { AnswerInput } from '@/components/flashcard/answer-input';
import { ProgressSection } from '@/components/flashcard/progress-section';
import { ActionButtons } from '@/components/flashcard/action-buttons';
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
  
  const { data: wordsData, isLoading, error } = useWordsData(moduleName);
  const { getSettings } = useSettingsStore();
  const trackAnswerMutation = useTrackAnswer();
  
  const settings = getSettings(moduleName);

  const currentItem = wordsData?.find((item, index) => index === currentItemId - 1);

  const handleAnswerSubmit = useCallback(async (userAnswer: string, serverValidationResult?: any) => {
    if (!currentItem) return;
    
    setIsUserInteraction(true);
    
    // Prepare correct answers for validation
    const correctAnswers = {
      hiragana: currentItem.hiragana,
      katakana: currentItem.katakana,
      english: currentItem.english,
      kanji: currentItem.kanji,
    };
    
    // Use comprehensive validation (frontend fallback)
    const validationResult = validateAnswer(userAnswer, correctAnswers, settings);
    const answerIsCorrect = serverValidationResult?.is_correct ?? validationResult.isCorrect;
    
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
      itemId: currentItem.id,
      userAnswer,
      isCorrect: answerIsCorrect,
      matchedType: validationResult.matchedType,
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
    
    // Track the answer result (currently logs to console, ready for backend)
    trackAnswerMutation.mutate(answerResult);
    
    // Handle feedback display
    if (answerIsCorrect) {
      // Move to next item after a delay
      setTimeout(() => {
        setCurrentItemId(prev => prev + 1);
        setCurrentAttempts(0);
        setIsCorrect(false);
        setIsUserInteraction(false);
      }, 1500);
    } else {
      // Check if max attempts reached
      const maxAttempts = settings.max_answer_attempts;
      const hasAttemptsLeft = maxAttempts === -1 || newAttempts < maxAttempts;
      
      if (!hasAttemptsLeft) {
        // Max attempts reached - show correct answer and move to next
        setTimeout(() => {
          setCurrentItemId(prev => prev + 1);
          setCurrentAttempts(0);
          setIsCorrect(false);
          setIsUserInteraction(false);
        }, 3000);
      } else {
        // Show incorrect feedback but allow more attempts
        setTimeout(() => {
          setIsUserInteraction(false);
        }, 2000);
      }
    }
  }, [currentItem, currentAttempts, settings]);

  const handleNext = useCallback(() => {
    setCurrentItemId(prev => prev + 1);
    setCurrentAttempts(0);
    setIsCorrect(false);
    setLastAnswer('');
    setLastMatchedType(undefined);
    setLastConvertedAnswer(undefined);
    setIsUserInteraction(false);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentItemId(prev => Math.max(1, prev - 1));
    setCurrentAttempts(0);
    setIsCorrect(false);
    setLastAnswer('');
    setLastMatchedType(undefined);
    setLastConvertedAnswer(undefined);
    setIsUserInteraction(false);
  }, []);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);


  useEffect(() => {
    if (wordsData && !isPageLoaded) {
      setIsPageLoaded(true);
    }
  }, [wordsData, isPageLoaded]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (!wordsData || !currentItem) {
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
                currentItem={currentItemId}
                totalItems={wordsData.length}
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
                disabled={isUserInteraction}
                settings={settings}
                isCorrect={isCorrect}
                currentItem={currentItem}
                lastAnswer={lastAnswer}
                lastMatchedType={lastMatchedType}
                lastConvertedAnswer={lastConvertedAnswer}
                moduleName={moduleName}
                enableServerValidation={true}
                enableRealtimeFeedback={true}
              />

              {/* Action Buttons */}
              <ActionButtons
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSkip={handleSkip}
                disabled={isUserInteraction}
                canGoPrevious={currentItemId > 1}
                canGoNext={currentItemId < wordsData.length}
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