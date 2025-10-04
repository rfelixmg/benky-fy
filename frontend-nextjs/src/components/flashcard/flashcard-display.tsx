'use client';

import { useState, useEffect } from 'react';
import { FlashcardItem, UserSettings } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Furigana, JapaneseText } from '@/components/japanese/furigana';

interface FlashcardDisplayProps {
  item: FlashcardItem;
  settings: UserSettings;
  isUserInteraction: boolean;
  mode: 'flashcard';
}

export function FlashcardDisplay({ 
  item, 
  settings, 
  isUserInteraction, 
  mode 
}: FlashcardDisplayProps) {
  // Remove flip functionality - flashcards should always show the question side
  const showAnswer = false;
  
  const renderJapaneseText = (text: string, furigana?: string) => {
    // Use the new Furigana component with mode prop
    if (furigana) {
      const furiganaStyle = settings.furigana_style || 'ruby';
      
      return (
        <Furigana
          kanji={text}
          furigana={furigana}
          showFurigana={true}
          mode={furiganaStyle as 'hover' | 'inline' | 'brackets' | 'ruby'}
          className="text-white"
        />
      );
    }

    return (
      <JapaneseText
        text={text}
        showFurigana={settings.furigana_style === 'hover'}
        className="text-white"
      />
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
      const displayMode = settings.display_mode || 'kana';
      const kanaType = settings.kana_type || 'hiragana';
      
      const renderDisplayText = () => {
        switch (displayMode) {
          case 'kanji':
            return item.kanji ? renderJapaneseText(item.kanji, item.furigana) : null;
          case 'kanji_furigana':
            return item.kanji ? renderJapaneseText(item.kanji, item.furigana) : null;
          case 'english':
            return <span className="text-white">{item.english}</span>;
          case 'kana':
          default:
            // Show hiragana or katakana based on kana_type setting
            if (kanaType === 'katakana' && item.katakana) {
              return renderJapaneseText(item.katakana, item.furigana);
            } else if (item.hiragana) {
              return renderJapaneseText(item.hiragana, item.furigana);
            } else if (item.katakana) {
              return renderJapaneseText(item.katakana, item.furigana);
            }
            return null;
        }
      };

      if (showAnswer) {
        return (
          <>
            <div className="text-4xl md:text-6xl font-bold text-white mb-4">
              <div className="mb-2">
                {renderDisplayText()}
              </div>
              {displayMode !== 'english' && (
                <div className="text-2xl text-white/80">
                  {item.english}
                </div>
              )}
            </div>
            <div className="text-sm text-white/70">Answer</div>
          </>
        );
      } else {
        return (
          <div className="text-4xl md:text-6xl font-bold text-white mb-4">
            <div className="mb-2">
              {renderDisplayText()}
            </div>
          </div>
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
          "relative bg-gradient-to-br from-primary-purple/20 to-secondary-purple/20 backdrop-blur-sm rounded-lg p-8 min-h-[300px] flex items-center justify-center transition-all duration-300 border border-primary-purple/30 shadow-lg",
          isUserInteraction && "opacity-75"
        )}
      >
        <div className="text-center">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}