'use client';

import { useState, useEffect } from 'react';
import { romajiToHiragana, detectScript } from '@/lib/romaji-conversion';

interface FuriganaProps {
  kanji: string;
  furigana?: string;
  showFurigana?: boolean;
  className?: string;
}

interface FuriganaCharacter {
  kanji: string;
  furigana: string;
  hasFurigana: boolean;
}

/**
 * Parse furigana data from various formats
 */
function parseFurigana(kanji: string, furigana?: string): FuriganaCharacter[] {
  if (!furigana) {
    return kanji.split('').map(char => ({
      kanji: char,
      furigana: '',
      hasFurigana: false,
    }));
  }

  // Handle different furigana formats
  const characters: FuriganaCharacter[] = [];
  let kanjiIndex = 0;
  let furiganaIndex = 0;

  while (kanjiIndex < kanji.length) {
    const currentKanji = kanji[kanjiIndex];
    
    // Check if this kanji has furigana
    if (furiganaIndex < furigana.length) {
      // Look for furigana that might be associated with this kanji
      // This is a simplified approach - in practice, you'd need more sophisticated parsing
      const nextSpace = furigana.indexOf(' ', furiganaIndex);
      const nextFurigana = nextSpace === -1 
        ? furigana.substring(furiganaIndex)
        : furigana.substring(furiganaIndex, nextSpace);
      
      characters.push({
        kanji: currentKanji,
        furigana: nextFurigana.trim(),
        hasFurigana: nextFurigana.trim().length > 0,
      });
      
      furiganaIndex = nextSpace === -1 ? furigana.length : nextSpace + 1;
    } else {
      characters.push({
        kanji: currentKanji,
        furigana: '',
        hasFurigana: false,
      });
    }
    
    kanjiIndex++;
  }

  return characters;
}

/**
 * Furigana rendering component
 */
export function Furigana({ kanji, furigana, showFurigana = true, className = '' }: FuriganaProps) {
  const [characters, setCharacters] = useState<FuriganaCharacter[]>([]);

  useEffect(() => {
    const parsed = parseFurigana(kanji, furigana);
    setCharacters(parsed);
  }, [kanji, furigana]);

  if (!showFurigana) {
    return <span className={className}>{kanji}</span>;
  }

  return (
    <div className={`inline-block ${className}`}>
      {characters.map((char, index) => (
        <div key={index} className="inline-block relative text-center">
          {char.hasFurigana && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
              {char.furigana}
            </div>
          )}
          <span className="text-white">{char.kanji}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Enhanced furigana component with romaji conversion support
 */
export function EnhancedFurigana({ 
  kanji, 
  furigana, 
  showFurigana = true, 
  showRomaji = false,
  className = '' 
}: FuriganaProps & { showRomaji?: boolean }) {
  const [characters, setCharacters] = useState<FuriganaCharacter[]>([]);

  useEffect(() => {
    const parsed = parseFurigana(kanji, furigana);
    setCharacters(parsed);
  }, [kanji, furigana]);

  if (!showFurigana && !showRomaji) {
    return <span className={className}>{kanji}</span>;
  }

  return (
    <div className={`inline-block ${className}`}>
      {characters.map((char, index) => (
        <div key={index} className="inline-block relative text-center">
          {/* Furigana */}
          {char.hasFurigana && showFurigana && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
              {char.furigana}
            </div>
          )}
          
          {/* Romaji */}
          {char.hasFurigana && showRomaji && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-white/50 whitespace-nowrap">
              {romajiToHiragana(char.furigana).converted}
            </div>
          )}
          
          <span className="text-white">{char.kanji}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Auto-detect and render Japanese text with appropriate furigana
 */
export function JapaneseText({ 
  text, 
  showFurigana = true, 
  showRomaji = false,
  className = '' 
}: { 
  text: string; 
  showFurigana?: boolean; 
  showRomaji?: boolean;
  className?: string;
}) {
  const scriptType = detectScript(text);

  if (scriptType === 'romaji') {
    const conversion = romajiToHiragana(text);
    return (
      <span className={className}>
        {conversion.converted}
        {showRomaji && (
          <span className="text-white/50 text-sm ml-2">({text})</span>
        )}
      </span>
    );
  }

  if (scriptType === 'hiragana' || scriptType === 'katakana') {
    return <span className={className}>{text}</span>;
  }

  // For kanji or mixed text, render as-is
  return <span className={className}>{text}</span>;
}
