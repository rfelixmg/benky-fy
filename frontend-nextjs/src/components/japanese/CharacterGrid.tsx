'use client';

import { useCallback, useRef, KeyboardEvent } from 'react';
import { Card, CardGrid } from '@/components/ui/Card';
import { Furigana } from './furigana';
import { textStyles, tooltipStyles, interactionStyles } from '@/styles/components';

export interface Character {
  character: string;
  reading: string;
}

interface CharacterGridProps {
  characters: Character[];
  onCharacterClick: (character: Character) => void;
  showReadings?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

export function CharacterGrid({
  characters,
  onCharacterClick,
  showReadings = true,
  columns = 4,
}: CharacterGridProps): JSX.Element {
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const buttons = gridRef.current?.querySelectorAll('button');
    if (!buttons) return;

    switch (e.key) {
      case 'Enter':
        onCharacterClick(characters[index]);
        break;
      default:
        break;
    }
  }, [columns, characters, onCharacterClick]);

  if (characters.length === 0) {
    return (
      <div className={`${textStyles.secondary} text-center p-4`}>
        No characters available
      </div>
    );
  }

  return (
    <CardGrid columns={columns} gap="md">
      {characters.map((char, index) => (
        <Card
          key={`${char.character}-${index}`}
          variant="primary"
          interactive
          className={tooltipStyles.container}
          onClick={() => onCharacterClick(char)}
        >
          <button
            className={`
              w-full h-full flex flex-col items-center justify-center
              ${interactionStyles.focus.ring}
              ${interactionStyles.transition.base}
            `}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-label={`Character ${char.character} (${char.reading})`}
          >
            <div className={textStyles['2xl']}>
              <Furigana
                kanji={char.character}
                hiragana={char.reading}
                showFurigana={false}
                mode="ruby"
              />
            </div>
            {showReadings && (
              <div className={`${textStyles.secondary} ${textStyles.sm} mt-2`}>
                {char.reading}
              </div>
            )}
            <div className={`
              ${tooltipStyles.base}
              ${tooltipStyles.top}
              ${tooltipStyles.content}
              ${tooltipStyles.animation}
            `}>
              {char.reading}
            </div>
          </button>
        </Card>
      ))}
    </CardGrid>
  );
}
