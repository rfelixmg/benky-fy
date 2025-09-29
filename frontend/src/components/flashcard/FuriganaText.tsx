'use client';

interface FuriganaTextProps {
  html?: string;
  text?: string;
  style?: 'html' | 'text';
}

export function FuriganaText({ html, text, style = 'html' }: FuriganaTextProps) {
  if (!html && !text) {
    return null;
  }

  if (style === 'html' && html) {
    return (
      <div
        className="kanji-with-furigana text-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="kanji-with-furigana-text text-2xl">
      {text}
    </div>
  );
}
