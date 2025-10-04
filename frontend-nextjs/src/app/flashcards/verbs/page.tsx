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
  FeedbackDisplay,
  ProgressSection,
  ProgressBar
} from '@/modules/flashcard/views';
import { FloatingFeedback } from '@/components/flashcard/floating-feedback';
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
import { UserSettings } from '@/lib/api-client';

export default function VerbsPage() {
  const moduleName = 'verbs';
  
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
  
  // Initialize MVC hooks
  const flashcardHook = useFlashcard();
  const answerHook = useAnswer();
  const progressHook = useProgress();
  const settingsHook = useSettings();

  // Load settings and set current module on component mount
  useEffect(() => {
    settingsHook.loadSettings(moduleName);
    progressHook.setCurrentModule(moduleName);
  }, [moduleName]);

  // State for API data
  const [apiVerbs, setApiVerbs] = useState<FlashcardItem[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashcardItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasFlashcards, setHasFlashcards] = useState(false);
  
  // UI state
  const [currentMode, setCurrentMode] = useState<'flashcard' | 'conjugation'>('flashcard');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showConjugationSettings, setShowConjugationSettings] = useState(false);
  const [selectedConjugationForm, setSelectedConjugationForm] = useState('polite');
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with v2 API data
  useEffect(() => {
    const loadVerbsFromAPI = async () => {
      try {
        console.log('Attempting to load verbs from v2 API...');
        const response = await fetch('/api/v2/words/verbs');
        console.log('API response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API data received:', data);
          
          if (data.words && data.words.length > 0) {
            // Convert all v2 API verbs to FlashcardItem format
            const convertedVerbs: FlashcardItem[] = data.words.map((verb: any) => ({
              id: verb.id,
              hiragana: verb.hiragana,
              kanji: verb.kanji,
              english: Array.isArray(verb.english) ? verb.english.join(', ') : verb.english,
              type: verb.type === 'noun' ? WordType.VERB : verb.type as WordType, // API returns 'noun' for verbs
              difficulty: 'beginner',
              furigana: verb.furigana || verb.hiragana,
              romaji: verb.romaji || ''
            }));
            
            console.log('Converted verbs:', convertedVerbs.length);
            console.log('Setting state with converted verbs...');
            setApiVerbs(convertedVerbs);
            setTotalCount(convertedVerbs.length);
            setHasFlashcards(true);
            setCurrentFlashcard(convertedVerbs[0]);
            setCurrentIndex(0);
            setIsInitialized(true);
            console.log('State set successfully, isInitialized should be true');
          }
        } else {
          console.error('API response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error loading verbs from v2 API:', error);
        // Fallback to mock data if API fails
        if (mockVerbs.length > 0) {
          console.log('Falling back to mock data');
          setApiVerbs(mockVerbs);
          setTotalCount(mockVerbs.length);
          setHasFlashcards(true);
          setCurrentFlashcard(mockVerbs[0]);
          setCurrentIndex(0);
          setIsInitialized(true);
        }
      }
    };

    // Set a timeout to force initialization after 3 seconds
    const timeoutId = setTimeout(() => {
      console.log('API timeout - forcing page load with mock data');
      if (mockVerbs.length > 0) {
        setApiVerbs(mockVerbs);
        setTotalCount(mockVerbs.length);
        setHasFlashcards(true);
        setCurrentFlashcard(mockVerbs[0]);
        setCurrentIndex(0);
        setIsInitialized(true);
      }
    }, 3000);

    loadVerbsFromAPI().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  // Remove mock data injection - use API data directly
  // useEffect(() => {
  //   // Access controller through the hook's internal reference
  //   const controller = (flashcardHook as any).controllerRef?.current;
  //   if (controller?.flashcardService) {
  //     controller.flashcardService.getFlashcards = async () => mockVerbs;
  //   }
  // }, []);

  const handleAnswerSubmit = useCallback(async (userAnswer: string | Record<string, string>) => {
    if (!currentFlashcard) return;

    try {
      // Submit answer using MVC architecture
      const answerString = typeof userAnswer === 'string' ? userAnswer : 
        `${userAnswer.hiragana || ''} / ${userAnswer.english || ''}`.replace(/ \/ $/, '');
      
      // Set current flashcard before submitting answer
      answerHook.setCurrentFlashcard(currentFlashcard);
      
      // Submit answer and wait for completion
      await answerHook.submitAnswer(answerString);
      
      // Get validation result after submission
      const validationResult = answerHook.validationResult;
      const isCorrect = answerHook.isCurrentAnswerCorrect();
      
      // Create answer result for progress tracking
      const answerResult: AnswerResult = {
        id: `answer-${Date.now()}`,
        flashcardId: currentFlashcard.id,
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
  }, [currentFlashcard, answerHook, progressHook, moduleName]);

  const handleNextFlashcard = useCallback(() => {
    if (currentIndex < totalCount - 1 && apiVerbs.length > 0) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentFlashcard(apiVerbs[nextIndex]);
      answerHook.setCurrentFlashcard(apiVerbs[nextIndex]);
      answerHook.clearAnswer();
    }
    setShowFloatingFeedback(false);
  }, [currentIndex, totalCount, apiVerbs, answerHook]);

  const handlePreviousFlashcard = useCallback(() => {
    if (currentIndex > 0 && apiVerbs.length > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentFlashcard(apiVerbs[prevIndex]);
      answerHook.setCurrentFlashcard(apiVerbs[prevIndex]);
      answerHook.clearAnswer();
    }
    setShowFloatingFeedback(false);
  }, [currentIndex, apiVerbs, answerHook]);

  const handleSkipFlashcard = useCallback(() => {
    if (currentIndex < totalCount - 1 && apiVerbs.length > 0) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentFlashcard(apiVerbs[nextIndex]);
      answerHook.setCurrentFlashcard(apiVerbs[nextIndex]);
      answerHook.clearAnswer();
    }
    setShowFloatingFeedback(false);
  }, [currentIndex, totalCount, apiVerbs, answerHook]);

  const handleFloatingFeedbackClose = useCallback(() => {
    setShowFloatingFeedback(false);
    handleNextFlashcard();
  }, [handleNextFlashcard]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Loading verbs module...</p>
        </div>
      </div>
    );
  }

  if (settingsHook.error || progressHook.error) {
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

  if (!currentFlashcard || !hasFlashcards) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Loading verbs...</p>
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
                currentItem={currentIndex + 1}
                totalItems={totalCount}
                progress={progressHook.progress || undefined}
                metrics={progressHook.metrics || undefined}
                settings={settingsHook.settings || { 
                  flashcard_type: 'mixed',
                  display_mode: 'mixed',
                  kana_type: 'hiragana',
                  input_hiragana: true,
                  input_romaji: false,
                  input_katakana: false,
                  input_kanji: false,
                  input_english: false,
                  furigana_style: 'small',
                  conjugation_forms: ['polite'],
                  practice_mode: 'normal',
                  priority_filter: 'all',
                  learning_order: false,
                  proportions: { kana: 0.3, kanji: 0.3, kanji_furigana: 0.2, english: 0.2 },
                  romaji_enabled: false,
                  romaji_output_type: 'hiragana',
                  max_answer_attempts: 3
                }}
                moduleName={moduleName}
                showMetrics={true}
                showInsights={true}
              />

              {/* Flashcard Display */}
              {currentFlashcard && (
                <FlashcardDisplay
                  flashcard={currentFlashcard}
                  settings={settingsHook.settings || { 
                  flashcard_type: 'mixed',
                  display_mode: 'mixed',
                  kana_type: 'hiragana',
                  input_hiragana: true,
                  input_romaji: false,
                  input_katakana: false,
                  input_kanji: false,
                  input_english: false,
                  furigana_style: 'small',
                  conjugation_forms: ['polite'],
                  practice_mode: 'normal',
                  priority_filter: 'all',
                  learning_order: false,
                  proportions: { kana: 0.3, kanji: 0.3, kanji_furigana: 0.2, english: 0.2 },
                  romaji_enabled: false,
                  romaji_output_type: 'hiragana',
                  max_answer_attempts: 3
                }}
                  isUserInteraction={answerHook.isSubmitting}
                  mode={currentMode}
                  onNext={handleNextFlashcard}
                  onPrevious={handlePreviousFlashcard}
                  onSkip={handleSkipFlashcard}
                  disabled={answerHook.isSubmitting}
                  canGoPrevious={currentIndex > 0}
                  canGoNext={currentIndex < totalCount - 1}
                />
              )}

              {/* Answer Input */}
              {currentFlashcard && (
                <AnswerInput
                  onSubmit={handleAnswerSubmit}
                  onAdvance={handleNextFlashcard}
                  disabled={answerHook.isSubmitting}
                  settings={settingsHook.settings || { 
                  flashcard_type: 'mixed',
                  display_mode: 'mixed',
                  kana_type: 'hiragana',
                  input_hiragana: true,
                  input_romaji: false,
                  input_katakana: false,
                  input_kanji: false,
                  input_english: false,
                  furigana_style: 'small',
                  conjugation_forms: ['polite'],
                  practice_mode: 'normal',
                  priority_filter: 'all',
                  learning_order: false,
                  proportions: { kana: 0.3, kanji: 0.3, kanji_furigana: 0.2, english: 0.2 },
                  romaji_enabled: false,
                  romaji_output_type: 'hiragana',
                  max_answer_attempts: 3
                }}
                  isCorrect={answerHook.isCurrentAnswerCorrect()}
                  currentItem={currentFlashcard}
                  lastAnswer={answerHook.userAnswer}
                  lastMatchedType={answerHook.validationResult?.matchedType}
                  lastConvertedAnswer={answerHook.validationResult?.convertedAnswer}
                  moduleName={moduleName}
                  enableServerValidation={false}
                  enableRealtimeFeedback={false}
                />
              )}

              {/* Answer Feedback */}
              {answerHook.showFeedback && answerHook.validationResult && (
                <FeedbackDisplay
                  feedbackData={{
                    item: currentFlashcard,
                    userAnswer: answerHook.userAnswer,
                    isCorrect: answerHook.isCurrentAnswerCorrect(),
                    validationResult: answerHook.validationResult
                  }}
                  settings={settingsHook.settings || { 
                  flashcard_type: 'mixed',
                  display_mode: 'mixed',
                  kana_type: 'hiragana',
                  input_hiragana: true,
                  input_romaji: false,
                  input_katakana: false,
                  input_kanji: false,
                  input_english: false,
                  furigana_style: 'small',
                  conjugation_forms: ['polite'],
                  practice_mode: 'normal',
                  priority_filter: 'all',
                  learning_order: false,
                  proportions: { kana: 0.3, kanji: 0.3, kanji_furigana: 0.2, english: 0.2 },
                  romaji_enabled: false,
                  romaji_output_type: 'hiragana',
                  max_answer_attempts: 3
                }}
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
          currentItemId={currentIndex + 1}
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
      {showFloatingFeedback && answerHook.validationResult && currentFlashcard && (
        <FloatingFeedback
          item={currentFlashcard}
          userAnswer={answerHook.userAnswer || ''}
          isCorrect={answerHook.isCurrentAnswerCorrect()}
          matchedType={answerHook.validationResult?.matchedType}
          convertedAnswer={answerHook.validationResult?.convertedAnswer}
          settings={settingsHook.settings || {
            input_hiragana: true,
            input_english: true,
            input_kanji: false,
            input_katakana: false,
            input_romaji: false,
            display_mode: 'mixed',
            furigana_style: 'below',
            practice_mode: 'flashcard',
            priority_filter: 'all',
            learning_order: false,
            proportions: { kana: 0.3, kanji: 0.3, kanji_furigana: 0.2, english: 0.2 },
            romaji_enabled: false,
            romaji_output_type: 'hiragana',
            flashcard_type: 'standard',
            kana_type: 'hiragana',
            furiganaEnabled: true,
            romajiEnabled: false,
            darkMode: false,
            allowedInputModes: { hiragana: true, katakana: false, english: true, kanji: false, romaji: false },
            max_answer_attempts: 3,
            conjugation_forms: []
          } as UserSettings}
          frontendValidationResult={answerHook.validationResult}
          userAnswers={{}}
          moduleName="verbs"
          timerDuration={3000}
          onClose={handleFloatingFeedbackClose}
        />
      )}
    </div>
  );
}
