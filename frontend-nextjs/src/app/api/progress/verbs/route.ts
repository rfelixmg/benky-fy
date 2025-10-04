import { NextRequest, NextResponse } from 'next/server';

// Default progress data for verbs module
const defaultProgress = {
  moduleName: 'verbs',
  totalItems: 10,
  completedItems: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTimeSpent: 0,
  averageTimePerItem: 0,
  accuracy: 0,
  lastStudied: null,
  studySessions: [],
  difficulty: 'beginner',
  masteryLevel: 0,
  nextReviewDate: null,
  spacedRepetition: {
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5
  }
};

export async function GET() {
  try {
    return NextResponse.json(defaultProgress);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real app, you would update the database here
    // For now, just return the updated progress data
    
    const updatedProgress = {
      ...defaultProgress,
      ...body,
      lastStudied: new Date().toISOString()
    };
    
    return NextResponse.json(updatedProgress);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
