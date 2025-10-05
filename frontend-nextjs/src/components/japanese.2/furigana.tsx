'use client';

import { useState, useEffect } from 'react';
import { romajiToHiragana, detectScript } from '@/lib/romaji-conversion';

type FuriganaMode = 'hover' | 'inline' | 'brackets' | 'ruby';

interface FuriganaProps {
  kanji: string;
  furigana?: string;
  hiragana?: string;
  showFurigana?: boolean;
  mode?: FuriganaMode;
  className?: string;
}

interface FuriganaCharacter {
  kanji: string;
  furigana: string;
  hasFurigana: boolean;
}

/**
 * Parse furigana data from various formats
 * Handles V2 API furigana_text format: "家[いえ]" or "学校[がっこう]"
 */
function parseFurigana(kanji: string, furigana?: string, hiragana?: string): FuriganaCharacter[] {
  if (!furigana || furigana.trim() === '') {
    return kanji.split('').map(char => ({
      kanji: char,
      furigana: '',
      hasFurigana: false,
    }));
  }

  // Parse furigana_text format like "家[いえ]" or "学校[がっこう]"
  const furiganaPattern = /\[([^\]]+)\]/g;
  const matches = [...furigana.matchAll(furiganaPattern)];
  
  if (matches.length > 0) {
    // Extract the reading from brackets
    const reading = matches[0][1];
    
    // Only apply furigana to kanji characters, not hiragana/katakana
    return kanji.split('').map(char => {
      const isKanji = /[\u4e00-\u9faf]/.test(char);
      return {
        kanji: char,
        furigana: isKanji ? reading : '',
        hasFurigana: isKanji,
      };
    });
  }

  // Fallback: treat furigana as a single reading for the whole word
  return kanji.split('').map(char => {
    const isKanji = /[\u4e00-\u9faf]/.test(char);
    return {
      kanji: char,
      furigana: isKanji ? furigana : '',
      hasFurigana: isKanji,
    };
  });
}

/**
 * Generate smart furigana by comparing kanji and hiragana
 * Shows only the difference between kanji and hiragana readings
 */
function generateSmartFurigana(kanji: string, hiragana: string): FuriganaCharacter[] {
  if (!hiragana) {
    return kanji.split('').map(char => ({
      kanji: char,
      furigana: '',
      hasFurigana: false,
    }));
  }

  // Simple approach: map kanji characters to hiragana characters
  // This is a basic implementation - could be enhanced with proper Japanese text analysis
  const kanjiChars = kanji.split('');
  const hiraganaChars = hiragana.split('');
  
  return kanjiChars.map((char, index) => {
    const isKanji = /[\u4e00-\u9faf]/.test(char);
    
    if (isKanji && index < hiraganaChars.length) {
      // For kanji, show the corresponding hiragana reading
      return {
        kanji: char,
        furigana: hiraganaChars[index] || '',
        hasFurigana: true,
      };
    }
    
    return {
      kanji: char,
      furigana: '',
      hasFurigana: false,
    };
  });
}

/**
 * Furigana rendering component with multiple display modes
 */
export function Furigana({ 
  kanji, 
  furigana, 
  hiragana,
  showFurigana = true, 
  mode = 'hover',
  className = '' 
}: FuriganaProps) {
  const [characters, setCharacters] = useState<FuriganaCharacter[]>([]);

  useEffect(() => {
    let parsed: FuriganaCharacter[];
    
    if (mode === 'ruby' && hiragana) {
      // Smart ruby mode: compare kanji and hiragana to show only differences
      parsed = generateSmartFurigana(kanji, hiragana);
    } else {
      // Standard mode: use furigana data from API
      parsed = parseFurigana(kanji, furigana, hiragana);
    }
    
    setCharacters(parsed);
  }, [kanji, furigana, hiragana, showFurigana, mode]);

  if (!showFurigana) {
    return <span className={className}>{kanji}</span>;
  }

  // Render based on mode
  switch (mode) {
    case 'hover':
      return (
        <div className={`inline-block ${className}`}>
          {characters.map((char, index) => (
            <div 
              key={index} 
              className="inline-block relative text-center group cursor-pointer"
            >
              {char.hasFurigana && (
                <div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 px-1 rounded"
                  style={{ zIndex: 10 }}
                >
                  {char.furigana}
                </div>
              )}
              <span className="text-white">{char.kanji}</span>
            </div>
          ))}
        </div>
      );

    case 'inline':
      return (
        <span className={className}>
          {kanji}
          {furigana && `「${furigana}」`}
        </span>
      );

    case 'brackets':
      return (
        <span className={className}>
          {characters.map((char, index) => (
            <span key={index}>
              {char.kanji}
              {char.hasFurigana && `「${char.furigana}」`}
            </span>
          ))}
        </span>
      );

    case 'ruby':
      return (
        <span className={className}>
          {characters.map((char, index) => (
            char.hasFurigana ? (
              <ruby key={index} className="text-white">
                {char.kanji}
                <rt className="text-xs text-white/70">{char.furigana}</rt>
              </ruby>
            ) : (
              <span key={index} className="text-white">{char.kanji}</span>
            )
          ))}
        </span>
      );

    default:
      return <span className={className}>{kanji}</span>;
  }
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
        <div key={index} className="inline-block relative text-center group">
          {/* Furigana */}
          {char.hasFurigana && showFurigana && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {char.furigana}
            </div>
          )}
          
          {/* Romaji */}
          {char.hasFurigana && showRomaji && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
