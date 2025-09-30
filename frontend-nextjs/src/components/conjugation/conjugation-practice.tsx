'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWordsData, validateConjugationAnswer } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { RomajiInput } from '@/components/japanese/romaji-input';
import { Loader2, CheckCircle, XCircle, RotateCcw, Shuffle } from 'lucide-react';

interface ConjugationPracticeProps {
  moduleName: string;
  initialForm?: string;
  onComplete?: () => void;
}

export function ConjugationPractice({ moduleName, initialForm = 'polite', onComplete }: ConjugationPracticeProps) {
  const [selectedForm, setSelectedForm] = useState(initialForm);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const { data: wordsData, isLoading: wordsLoading } = useWordsData(moduleName);

  // Available conjugation forms for different word types
  const availableForms = useMemo(() => {
    const forms = ['polite', 'negative', 'past', 'past_negative'];
    return forms;
  }, []);

  // Get current word for practice
  const currentWord = useMemo(() => {
    if (!wordsData || wordsData.length === 0) return null;
    return wordsData[currentWordIndex];
  }, [wordsData, currentWordIndex]);

  // Generate conjugation for current word and form
  const currentConjugation = useMemo(() => {
    if (!currentWord) return null;
    
    const baseHiragana = currentWord.hiragana || '';
    const baseKanji = currentWord.kanji || '';
    
    // Simple conjugation patterns (matching V2 API logic)
    switch (selectedForm) {
      case 'polite':
        return {
          form: 'polite',
          kanji: baseKanji + 'ます',
          hiragana: baseHiragana + 'ます'
        };
      case 'negative':
        return {
          form: 'negative', 
          kanji: baseKanji + 'ない',
          hiragana: baseHiragana + 'ない'
        };
      case 'past':
        return {
          form: 'past',
          kanji: baseKanji + 'た', 
          hiragana: baseHiragana + 'た'
        };
      case 'past_negative':
        return {
          form: 'past_negative',
          kanji: baseKanji + 'なかった',
          hiragana: baseHiragana + 'なかった'
        };
      default:
        return null;
    }
  }, [currentWord, selectedForm]);

  const handleFormChange = (form: string) => {
    setSelectedForm(form);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setCorrectAnswer('');
    setFeedback('');
  };

  const handleSubmit = () => {
    if (!currentConjugation || !userAnswer.trim()) return;

    const result = validateConjugationAnswer(userAnswer.trim(), currentConjugation.hiragana);
    
    setIsCorrect(result.isCorrect);
    setCorrectAnswer(currentConjugation.hiragana);
    setFeedback(result.feedback);
    setShowResult(true);
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setCorrectAnswer('');
    setFeedback('');
    
    // Move to next word
    if (wordsData && currentWordIndex < wordsData.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // Reset to first word
      setCurrentWordIndex(0);
    }
  };

  const handleShuffle = () => {
    if (!wordsData) return;
    const randomIndex = Math.floor(Math.random() * wordsData.length);
    setCurrentWordIndex(randomIndex);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setCorrectAnswer('');
    setFeedback('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit();
    }
  };

  if (wordsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">Loading conjugation practice...</span>
      </div>
    );
  }

  if (!wordsData || wordsData.length === 0 || !currentWord || !currentConjugation) {
    return (
      <div className="text-center p-8">
        <p className="text-white/80">No conjugation data available for this module.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Form Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Select Conjugation Form:</h3>
        <div className="flex flex-wrap gap-2">
          {availableForms.map((form) => (
            <Button
              key={form}
              variant={selectedForm === form ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormChange(form)}
              className={selectedForm === form 
                ? "bg-white text-primary-purple hover:bg-white/90" 
                : "border-white/30 text-white hover:bg-white/10"
              }
            >
              {form.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Practice Item */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentWord.kanji || currentWord.hiragana}
          </h2>
          <p className="text-white/80 text-lg">{currentWord.english}</p>
          <p className="text-white/60 text-sm">
            Word {currentWordIndex + 1} of {wordsData.length}
          </p>
        </div>

        <div className="text-center mb-4">
          <p className="text-white font-medium">
            Conjugate "{currentWord.english}" in {selectedForm.replace('_', ' ')} form
          </p>
        </div>

        {/* Answer Input */}
        <div className="mb-4">
          <RomajiInput
            value={userAnswer}
            onChange={setUserAnswer}
            onKeyPress={handleKeyPress}
            placeholder="Enter your answer..."
            disabled={showResult}
            showPreview={true}
            outputType="auto"
            className="text-lg"
          />
        </div>

        {/* Submit Button */}
        {!showResult && (
          <div className="text-center">
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="bg-white text-primary-purple hover:bg-white/90 px-8 py-2"
            >
              Check Answer
            </Button>
          </div>
        )}

        {/* Result Display */}
        {showResult && (
          <div className="text-center">
            <div className="mb-4">
              {isCorrect ? (
                <div className="flex items-center justify-center text-green-400 mb-2">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  <span className="text-lg font-semibold">Correct!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center text-red-400 mb-2">
                  <XCircle className="h-6 w-6 mr-2" />
                  <span className="text-lg font-semibold">Incorrect</span>
                </div>
              )}
            </div>

            {!isCorrect && correctAnswer && (
              <div className="mb-4">
                <p className="text-white/80 mb-1">Correct answer:</p>
                <p className="text-white text-xl font-semibold">{correctAnswer}</p>
              </div>
            )}

            {feedback && (
              <div className="mb-4">
                <p className="text-white/80">{feedback}</p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleNext}
                className="bg-white text-primary-purple hover:bg-white/90 px-6 py-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Next Word
              </Button>
              <Button
                onClick={handleShuffle}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6 py-2"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle
              </Button>
              {onComplete && (
                <Button
                  onClick={onComplete}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-6 py-2"
                >
                  Finish Practice
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
