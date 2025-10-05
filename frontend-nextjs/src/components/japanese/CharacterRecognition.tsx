'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { detectScript, isHiragana, isKatakana } from '@/core/romaji-conversion';

interface CharacterInfo {
  character: string;
  type: 'hiragana' | 'katakana' | 'kanji' | 'unknown';
  reading: string;
}

interface CharacterRecognitionProps {
  text: string;
  onCharacterIdentified: (info: CharacterInfo) => void;
  onError: (message: string) => void;
}

// Kanji readings mapping (simplified for demo)
const KANJI_READINGS: Record<string, string> = {
  '私': 'わたし',
  '日': 'に',
  '本': 'ほん',
  '語': 'ご',
  '勉': 'べん',
  '強': 'きょう',
};

export function CharacterRecognition({
  text,
  onCharacterIdentified,
  onError,
}: CharacterRecognitionProps): JSX.Element {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [hoveredChar, setHoveredChar] = useState<CharacterInfo | null>(null);

  const identifyCharacter = useCallback((char: string): CharacterInfo => {
    if (isHiragana(char)) {
      return {
        character: char,
        type: 'hiragana',
        reading: char,
      };
    }

    if (isKatakana(char)) {
      return {
        character: char,
        type: 'katakana',
        reading: char.toLowerCase(), // Simplified for demo
      };
    }

    if (KANJI_READINGS[char]) {
      return {
        character: char,
        type: 'kanji',
        reading: KANJI_READINGS[char],
      };
    }

    return {
      character: char,
      type: 'unknown',
      reading: char,
    };
  }, []);

  const handleCharacterClick = useCallback((char: string) => {
    const info = identifyCharacter(char);
    if (info.type === 'unknown') {
      onError('Unknown character type');
    } else {
      onCharacterIdentified(info);
    }
  }, [identifyCharacter, onCharacterIdentified, onError]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        handleCharacterClick(text[index]);
        break;
      case 'ArrowLeft':
        setFocusedIndex(Math.max(0, index - 1));
        break;
      case 'ArrowRight':
        setFocusedIndex(Math.min(text.length - 1, index + 1));
        break;
      default:
        break;
    }
  }, [text, handleCharacterClick]);

  return (
    <div className="flex flex-wrap gap-1 p-4">
      {text.split('').map((char, index) => {
        const info = identifyCharacter(char);
        const isFocused = index === focusedIndex;

        return (
          <button
            key={`${char}-${index}`}
            className={`
              relative p-2 min-w-[2.5rem] h-10 text-lg
              rounded-lg border-2 transition-colors
              ${isFocused ? 'border-blue-500' : 'border-transparent'}
              hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            onClick={() => handleCharacterClick(char)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onMouseEnter={() => setHoveredChar(info)}
            onMouseLeave={() => setHoveredChar(null)}
            onFocus={() => setFocusedIndex(index)}
            aria-label={`Character ${char}`}
          >
            {char}
            {hoveredChar && hoveredChar.character === char && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                <div>{hoveredChar.reading}</div>
                <div className="text-xs text-white/70">{hoveredChar.type}</div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
