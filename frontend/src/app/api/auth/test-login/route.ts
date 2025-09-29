import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const flaskUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const testHash = process.env.BENKY_FY_TEST_HASH || 'a1b2c3d4e5f6'; // fallback hash
    const response = await fetch(`${flaskUrl}/auth/login`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Test-Mode': testHash,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Test login failed:', errorText);
      
      // Specific error for connection refused
      if (errorText.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Flask server is not running. Please start the Flask server and try again.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to login with test user' },
        { status: response.status }
      );
    }

    // Get the session cookie from Flask response
    const cookies = response.headers.get('set-cookie');
    
    // Create redirect response
    const redirectResponse = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
    
    // Forward the session cookie if present
    if (cookies) {
      redirectResponse.headers.set('Set-Cookie', cookies);
    }

    return redirectResponse;
  } catch (error) {
    console.error('Test login error:', error);
    
    // Check for network errors (Flask not running)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Could not connect to Flask server. Please ensure it is running.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}