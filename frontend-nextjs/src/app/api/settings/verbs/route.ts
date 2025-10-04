import { NextRequest, NextResponse } from 'next/server';

// Default settings for verbs module
const defaultSettings = {
  inputHiragana: true,
  inputEnglish: true,
  inputKanji: false,
  inputKatakana: false,
  inputRomaji: false,
  maxAttempts: 3,
  displayMode: 'hiragana',
  furiganaStyle: 'below',
  practiceMode: 'flashcard',
  priorityFilter: 'all',
  romajiOutputType: 'hiragana',
  flashcardType: 'standard',
  kanaType: 'hiragana',
  difficulty: 'beginner',
  proportions: {
    hiragana: 0.4,
    english: 0.4,
    kanji: 0.2
  },
  enableHints: true,
  enableTimer: false,
  timerDuration: 30,
  enableSound: false,
  enableVibration: false,
  autoAdvance: false,
  showProgress: true,
  showStatistics: true,
  enableDarkMode: false,
  fontSize: 'medium',
  theme: 'default'
};

export async function GET() {
  try {
    return NextResponse.json(defaultSettings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updatedSettings = { ...defaultSettings, ...body };
    
    // In a real app, you would save to database here
    // For now, just return the updated settings
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
