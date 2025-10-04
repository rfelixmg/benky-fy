'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FlashcardDisplay } from '@/components/flashcard/flashcard-display';
import { AnswerInput } from '@/components/flashcard/answer-input';
import { ProgressSection } from '@/components/flashcard/progress-section';
import { SettingsModal } from '@/components/flashcard/settings-modal';
import { FloatingFeedback } from '@/components/flashcard/floating-feedback';
import { HelpModal } from '@/components/flashcard/help-modal';
import { Statistics } from '@/components/flashcard/statistics';
import { NavigationHeader } from '@/components/navigation-header';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, HelpCircle } from 'lucide-react';
import { FlashcardItem, WordType } from '@/modules/flashcard/types/FlashcardTypes';
import { useSettingsStore } from '@/lib/settings-store';

export default function ColorsPage() {
  const moduleName = 'colors_basic';
  
  // State management for random mode
  const [currentWord, setCurrentWord] = useState<FlashcardItem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserInteraction, setIsUserInteraction] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lastAnswer, setLastAnswer] = useState('');
  const [lastMatchedType, setLastMatchedType] = useState<string | undefined>();
  const [lastConvertedAnswer, setLastConvertedAnswer] = useState<string | undefined>();
  const [testedWord, setTestedWord] = useState<any>(null);
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(false);
  const [lastValidationResult, setLastValidationResult] = useState<any>(null);
  const [lastUserAnswers, setLastUserAnswers] = useState<Record<string, string>>({});
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { getSettings } = useSettingsStore();
  const settings = getSettings(moduleName);


  // Load initial random word from v2 API
  useEffect(() => {
    const loadRandomWord = async () => {
      try {
        console.log(`Loading random ${moduleName} from v2 API...`);
        const response = await fetch(`/api/v2/words/${moduleName}/random`);
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Random word received:', data);
          
          if (data) {
            // Convert v2 API word to FlashcardItem format
            const convertedWord: FlashcardItem = {
              id: data.id,
              hiragana: data.hiragana,
              kanji: data.kanji,
              english: Array.isArray(data.english) ? data.english.join(', ') : data.english,
              type: data.type === 'noun' ? WordType.NOUN : data.type as WordType,
              difficulty: 'beginner',
              furigana: data.furigana || data.hiragana,
              romaji: data.romaji || ''
            };
            
            setCurrentWord(convertedWord);
            setIsInitialized(true);
          }
        } else {
          console.error('API response not ok:', response.status, response.statusText);
          setIsInitialized(false);
        }
      } catch (error) {
        console.error(`Error loading random ${moduleName} from v2 API:`, error);
        setIsInitialized(false);
      }
    };

    loadRandomWord();
  }, [moduleName]);

  // Navigation functions using random API calls
  const navigateToNext = useCallback(async () => {
    try {
      console.log(`Fetching new random ${moduleName}...`);
      const response = await fetch(`/api/v2/words/${moduleName}/random`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('New random word received:', data);
        
        if (data) {
          const convertedWord: FlashcardItem = {
            id: data.id,
            hiragana: data.hiragana,
            kanji: data.kanji,
            english: Array.isArray(data.english) ? data.english.join(', ') : data.english,
            type: data.type === 'noun' ? WordType.NOUN : data.type as WordType,
            difficulty: 'beginner',
            furigana: data.furigana || data.hiragana,
            romaji: data.romaji || ''
          };
          
          setCurrentWord(convertedWord);
          setCurrentAttempts(0);
          setIsCorrect(false);
          setIsUserInteraction(false);
          setTestedWord(null);
        }
      }
    } catch (error) {
      console.error(`Error fetching new random ${moduleName}:`, error);
    }
  }, [moduleName]);

  const navigateToPrevious = useCallback(async () => {
    // For random mode, "previous" also fetches a new random word
    await navigateToNext();
  }, [navigateToNext]);

  // Manual advance function that clears timer and resets state
  const manualAdvance = useCallback(async () => {
    // Clear any pending auto-advance timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    
    // Navigate to next item
    await navigateToNext();
    
    // Reset state for next item
    setLastUserAnswers({});
  }, [navigateToNext]);

  // Current item logic
  const currentItem = currentWord;
  const isLoadingData = !isInitialized;

  const handleAnswerSubmit = useCallback(async (userAnswer: string | { english: string; hiragana: string; katakana?: string; kanji?: string; romaji?: string }, serverValidationResult?: any) => {
    if (!currentItem) return;
    
    const answerString = typeof userAnswer === 'string' ? userAnswer : userAnswer.english;
    setLastAnswer(answerString);
    setTestedWord(currentItem);
    setIsUserInteraction(true);
    setCurrentAttempts(prev => prev + 1);
    
    // Simple validation for colors
    const isAnswerCorrect = answerString.toLowerCase().trim() === currentItem.english.toLowerCase().trim();
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      setShowFloatingFeedback(true);
    }
  }, [currentItem]);

  // Handle floating feedback close and advance
  const handleFloatingFeedbackClose = useCallback(async () => {
    setShowFloatingFeedback(false);
    // Move to next item
    await navigateToNext();
    // Reset state for next item
    setIsCorrect(false);
    setIsUserInteraction(false);
    setTestedWord(null);
    setLastUserAnswers({});
  }, [navigateToNext]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      {/* Navigation Header */}
      <NavigationHeader currentPage={`/flashcards/${moduleName}`} />
      
      {/* Header Controls */}
      <div className="relative z-10 px-6 pt-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">Japanese Colors</h1>
            <p className="text-primary-foreground/80">Learn color words in Japanese</p>
          </div>
          
          <div className="flex gap-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingData && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-purple mb-4" />
          <p className="text-lg text-gray-600">Loading colors flashcards...</p>
        </div>
      )}

      {/* Main Content */}
      {!isLoadingData && currentItem && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="w-full max-w-4xl">
            {/* Progress Section */}
            <ProgressSection
              currentItem={1}
              totalItems={1}
              moduleName={moduleName}
            />

            {/* Flashcard Display */}
            {currentItem && (
              <FlashcardDisplay
                item={currentItem}
                settings={settings}
                isUserInteraction={isUserInteraction}
                mode="flashcard"
              />
            )}

            {/* Answer Input */}
            <AnswerInput
              onSubmit={handleAnswerSubmit}
              onAdvance={manualAdvance}
              disabled={isUserInteraction}
              settings={settings}
              isCorrect={isCorrect}
              currentItem={currentItem}
              lastAnswer={lastAnswer}
              lastMatchedType={lastMatchedType}
              lastConvertedAnswer={lastConvertedAnswer}
              moduleName={moduleName}
              enableServerValidation={false}
              enableRealtimeFeedback={false}
            />
          </div>
        </div>
      )}

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
          currentItemId={1}
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
              <Statistics moduleName={moduleName} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Modal */}
      {showFloatingFeedback && currentItem && (
        <FloatingFeedback
          item={currentItem}
          userAnswer={lastAnswer}
          isCorrect={isCorrect}
          matchedType={lastMatchedType}
          convertedAnswer={lastConvertedAnswer}
          settings={settings}
          frontendValidationResult={lastValidationResult}
          userAnswers={lastUserAnswers}
          moduleName={moduleName}
          timerDuration={lastValidationResult?.timerDuration ?? 10_000}
          onClose={handleFloatingFeedbackClose}
        />
      )}
    </div>
  );
}
