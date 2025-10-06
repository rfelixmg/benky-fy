'use client';

import { FlashcardItem, UserSettings } from "@/core/api-client";
import { Furigana, JapaneseText } from "@/components/japanese/furigana";

interface WordDisplayProps {
  item: FlashcardItem;
  settings: UserSettings;
  displayMode?: string;
  kanaType?: string;
  className?: string;
}

export function WordDisplay({
  item,
  settings,
  displayMode = 'kana',
  kanaType = 'hiragana',
  className = '',
}: WordDisplayProps) {
  const renderJapaneseText = (text: string, furigana?: string) => {
    if (furigana) {
      const furiganaStyle = settings.furigana_style || "ruby";

      return (
        <Furigana
          kanji={text}
          furigana={furigana}
          showFurigana={true}
          mode={furiganaStyle as "hover" | "inline" | "brackets" | "ruby"}
          className={className || "text-white"}
        />
      );
    }

    return (
      <JapaneseText
        text={text}
        showFurigana={settings.furigana_style === "hover"}
        className={className || "text-white"}
      />
    );
  };

  const renderDisplayText = () => {
    switch (displayMode) {
      case "kanji":
      case "kanji_furigana":
        return item.kanji
          ? renderJapaneseText(item.kanji, item.furigana)
          : null;
      case "english":
        return <span className={className || "text-white"}>{item.english}</span>;
      case "kana":
      default:
        // Show hiragana or katakana based on kana_type setting
        if (kanaType === "katakana" && item.katakana) {
          return renderJapaneseText(item.katakana, item.furigana);
        } else if (item.hiragana) {
          return renderJapaneseText(item.hiragana, item.furigana);
        } else if (item.katakana) {
          return renderJapaneseText(item.katakana, item.furigana);
        }
        return null;
    }
  };

  return renderDisplayText();
}
