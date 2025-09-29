export type Script = 'hiragana' | 'katakana' | 'kanji' | 'romaji';
export type JapaneseChar = string;
export type RomajiChar = string;

export interface ConversionOptions {
  script: Script;
  allowPartial?: boolean;
  convertLongVowels?: boolean;
}

export interface ConversionMap {
  hiragana: Record<RomajiChar, JapaneseChar>;
  katakana: Record<RomajiChar, JapaneseChar>;
}
