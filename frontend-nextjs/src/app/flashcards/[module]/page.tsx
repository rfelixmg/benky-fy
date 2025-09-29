'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useWordsData, validateAnswer } from '@/lib/hooks';
import { useSettingsStore } from '@/lib/settings-store';
import { FlashcardDisplay } from '@/components/flashcard/flashcard-display';
import { AnswerInput } from '@/components/flashcard/answer-input';
import { ProgressSection } from '@/components/flashcard/progress-section';
import { ActionButtons } from '@/components/flashcard/action-buttons';
import { SettingsModal } from '@/components/flashcard/settings-modal';
import { HelpModal } from '@/components/flashcard/help-modal';
import { Statistics } from '@/components/flashcard/statistics';
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
  
  const { data: wordsData, isLoading, error } = useWordsData(moduleName);
  const { getSettings } = useSettingsStore();
  
  const settings = getSettings(moduleName);

  const currentItem = wordsData?.find((item, index) => index === currentItemId - 1);

  const handleAnswerSubmit = useCallback(async (userAnswer: string) => {
    if (!currentItem) return;
    
    setIsUserInteraction(true);
    
    // Frontend validation (V2 API doesn't provide answer checking)
    const correctAnswer = currentItem.english || currentItem.hiragana || currentItem.kanji || '';
    const isCorrect = validateAnswer(userAnswer, correctAnswer);
    
    // Handle feedback display
    if (isCorrect) {
      // Move to next item after a delay
      setTimeout(() => {
        setCurrentItemId(prev => prev + 1);
        setIsUserInteraction(false);
      }, 1500);
    } else {
      // Show incorrect feedback
      setTimeout(() => {
        setIsUserInteraction(false);
      }, 2000);
    }
  }, [currentItem]);

  const handleNext = useCallback(() => {
    setCurrentItemId(prev => prev + 1);
    setIsUserInteraction(false);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentItemId(prev => Math.max(1, prev - 1));
    setIsUserInteraction(false);
  }, []);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);


  useEffect(() => {
    if (flashcardData && !isPageLoaded) {
      setIsPageLoaded(true);
    }
  }, [flashcardData, isPageLoaded]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <p className="text-white mb-4">Error loading flashcards</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!flashcardData || !currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <p className="text-white">No flashcards available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white capitalize">
            {moduleName} Flashcards
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMode(prev => prev === 'flashcard' ? 'conjugation' : 'flashcard')}
            className="border-white text-white hover:bg-white/10"
          >
            {currentMode === 'flashcard' ? 'Switch to Conjugation' : 'Switch to Flashcards'}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(true)}
            className="border-white text-white hover:bg-white/10"
          >
            Statistics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="border-white text-white hover:bg-white/10"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="border-white text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-4xl">
          {/* Progress Section */}
          <ProgressSection
            currentItem={currentItemId}
            totalItems={flashcardData.length}
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
          />

          {/* Action Buttons */}
          <ActionButtons
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            disabled={isUserInteraction}
            canGoPrevious={currentItemId > 1}
            canGoNext={currentItemId < flashcardData.length}
          />
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
        <Statistics
          moduleName={moduleName}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}