import { NextResponse } from 'next/server';

const colorsData = {
  colors: [
    { kanji: '赤', hiragana: 'あか', english: 'red', hex: '#ff0000' },
    { kanji: '青', hiragana: 'あお', english: 'blue', hex: '#0000ff' },
    { kanji: '黄色', hiragana: 'きいろ', english: 'yellow', hex: '#ffff00' },
    { kanji: '緑', hiragana: 'みどり', english: 'green', hex: '#008000' },
    { kanji: '紫', hiragana: 'むらさき', english: 'purple', hex: '#800080' },
    { kanji: '茶色', hiragana: 'ちゃいろ', english: 'brown', hex: '#964b00' },
    { kanji: '白', hiragana: 'しろ', english: 'white', hex: '#ffffff' },
    { kanji: '黒', hiragana: 'くろ', english: 'black', hex: '#000000' },
    { kanji: '灰色', hiragana: 'はいいろ', english: 'gray', hex: '#808080' },
    { kanji: '桃色', hiragana: 'ももいろ', english: 'pink', hex: '#ffc0cb' },
  ],
  practice_sets: [
    {
      id: 'basic-colors',
      colors: ['赤', '青', '黄色', '緑'],
      type: 'reading',
    },
    {
      id: 'dark-colors',
      colors: ['黒', '紫', '茶色'],
      type: 'reading',
    },
    {
      id: 'light-colors',
      colors: ['白', '桃色', '灰色'],
      type: 'reading',
    },
  ],
  quiz_questions: [
    {
      id: '1',
      question: '赤',
      correctAnswer: 'あか',
      options: ['あか', 'あお', 'きいろ'],
      hint: 'Color of fire',
    },
    {
      id: '2',
      question: '青',
      correctAnswer: 'あお',
      options: ['あお', 'みどり', 'むらさき'],
      hint: 'Color of the sky',
    },
    {
      id: '3',
      question: '黄色',
      correctAnswer: 'きいろ',
      options: ['きいろ', 'くろ', 'しろ'],
      hint: 'Color of the sun',
    },
  ],
};

export async function GET() {
  return NextResponse.json(colorsData);
}
