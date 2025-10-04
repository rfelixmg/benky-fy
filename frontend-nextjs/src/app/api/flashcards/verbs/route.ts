import { NextResponse } from 'next/server';

// Mock verbs data - matches the data in the verbs page
const verbsData = {
  flashcards: [
    {
      id: 'verb-1',
      hiragana: 'たべる',
      kanji: '食べる',
      english: 'to eat',
      type: 'verb',
      difficulty: 'beginner',
      furigana: 'たべる',
      romaji: 'taberu'
    },
    {
      id: 'verb-2',
      hiragana: 'いく',
      kanji: '行く',
      english: 'to go',
      type: 'verb',
      difficulty: 'beginner',
      furigana: 'いく',
      romaji: 'iku'
    },
    {
      id: 'verb-3',
      hiragana: 'くる',
      kanji: '来る',
      english: 'to come',
      type: 'verb',
      difficulty: 'beginner',
      furigana: 'くる',
      romaji: 'kuru'
    },
    {
      id: 'verb-4',
      hiragana: 'する',
      kanji: 'する',
      english: 'to do',
      type: 'verb',
      difficulty: 'beginner',
      furigana: 'する',
      romaji: 'suru'
    },
    {
      id: 'verb-5',
      hiragana: 'みる',
      kanji: '見る',
      english: 'to see',
      type: 'verb',
      difficulty: 'beginner',
      furigana: 'みる',
      romaji: 'miru'
    },
    {
      id: 'verb-6',
      hiragana: 'べんきょうする',
      kanji: '勉強する',
      english: 'to study',
      type: 'verb',
      difficulty: 'intermediate',
      furigana: 'べんきょうする',
      romaji: 'benkyou suru'
    },
    {
      id: 'verb-7',
      hiragana: 'はなす',
      kanji: '話す',
      english: 'to speak, to talk',
      type: 'verb',
      difficulty: 'intermediate',
      furigana: 'はなす',
      romaji: 'hanasu'
    },
    {
      id: 'verb-8',
      hiragana: 'かう',
      kanji: '買う',
      english: 'to buy',
      type: 'verb',
      difficulty: 'beginner',
      furigana: 'かう',
      romaji: 'kau'
    },
    {
      id: 'verb-9',
      hiragana: 'たべる',
      kanji: '食べる',
      english: 'to eat',
      type: 'verb',
      difficulty: 'beginner',
      furigana: 'たべる',
      romaji: 'taberu'
    },
    {
      id: 'verb-10',
      hiragana: 'おぼえる',
      kanji: '覚える',
      english: 'to remember',
      type: 'verb',
      difficulty: 'intermediate',
      furigana: 'おぼえる',
      romaji: 'oboeru'
    }
  ],
  totalCount: 10,
  moduleName: 'verbs',
  difficulty: 'mixed',
  categories: ['basic', 'irregular', 'special']
};

export async function GET() {
  try {
    return NextResponse.json(verbsData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load verbs flashcards' },
      { status: 500 }
    );
  }
}
