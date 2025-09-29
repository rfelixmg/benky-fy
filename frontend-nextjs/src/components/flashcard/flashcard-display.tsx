'use client';

import { useState, useEffect } from 'react';
import { FlashcardItem, UserSettings } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface FlashcardDisplayProps {
  item: FlashcardItem;
  settings: UserSettings;
  isUserInteraction: boolean;
  mode: 'flashcard' | 'conjugation';
}

export function FlashcardDisplay({ 
  item, 
  settings, 
  isUserInteraction, 
  mode 
}: FlashcardDisplayProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
  }, [item.id]);

  const handleFlip = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setShowAnswer(true);
    
    setTimeout(() => {
      setIsFlipping(false);
    }, 600);
  };

  const renderFurigana = (text: string, furigana?: string) => {
    if (!settings.furiganaEnabled || !furigana) {
      return text;
    }

    // Simple furigana rendering - in a real app you'd use a proper Japanese text renderer
    return (
      <span className="relative">
        {text}
        {furigana && (
          <span className="absolute -top-6 left-0 text-xs text-muted-foreground">
            {furigana}
          </span>
        )}
      </span>
    );
  };

  const renderRomaji = (text: string, romaji?: string) => {
    if (!settings.romajiEnabled || !romaji) {
      return null;
    }

    return (
      <div className="text-sm text-muted-foreground mt-2">
        {romaji}
      </div>
    );
  };

  const renderContent = () => {
    if (mode === 'flashcard') {
      if (showAnswer) {
        return (
          <>
            <div className="text-4xl md:text-6xl font-bold text-white mb-4">
              {item.kanji && (
                <div className="mb-2">
                  {renderFurigana(item.kanji, item.furigana)}
                </div>
              )}
              {item.hiragana && (
                <div className="mb-2">
                  {renderFurigana(item.hiragana, item.furigana)}
                </div>
              )}
              <div className="text-2xl text-white/80">
                {item.english}
              </div>
            </div>
            <div className="text-sm text-white/70">Answer</div>
          </>
        );
      } else {
        return (
          <>
            <div className="text-4xl md:text-6xl font-bold text-white mb-4">
              {item.kanji && (
                <div className="mb-2">
                  {renderFurigana(item.kanji, item.furigana)}
                </div>
              )}
              {item.hiragana && (
                <div className="mb-2">
                  {renderFurigana(item.hiragana, item.furigana)}
                </div>
              )}
            </div>
            <div className="text-sm text-white/70">Question</div>
          </>
        );
      }
    } else {
      // Conjugation mode - show base form
      return (
        <>
          <div className="text-3xl md:text-5xl font-bold text-white mb-4">
            {item.kanji || item.hiragana}
          </div>
          <div className="text-lg text-white/80 mb-2">
            {item.type} - {item.english}
          </div>
          {showAnswer && (
            <div className="text-2xl text-white font-semibold">
              Conjugation forms available
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div 
        className={cn(
          "relative bg-white/10 backdrop-blur-sm rounded-lg p-8 min-h-[300px] flex items-center justify-center transition-all duration-300",
          isFlipping && "transform scale-105",
          isUserInteraction && "opacity-75"
        )}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
        aria-label="Click to flip flashcard"
      >
        <div className="text-center">
          {renderContent()}
        </div>
        
        {/* Flip indicator */}
        <div className="absolute bottom-4 right-4 text-white/50 text-sm">
          Click to flip
        </div>
      </div>
      
      {/* Word type indicator */}
      <div className="flex justify-center mt-4">
        <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
          {item.type}
        </div>
      </div>
    </div>
  );
}