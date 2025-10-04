import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/v2/words/verbs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching verbs from backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verbs' },
      { status: 500 }
    );
  }
}
