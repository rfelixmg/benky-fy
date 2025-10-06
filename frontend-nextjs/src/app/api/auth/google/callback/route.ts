import { NextRequest, NextResponse } from 'next/server';

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.AUTH_BASE_URL || 'https://benkyfy.site';
  }
  return process.env.AUTH_BASE_URL || 'http://localhost:3000';
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userParam = searchParams.get('user');
  
  if (!userParam) {
    return NextResponse.redirect(new URL('/auth/login', getBaseUrl()));
  }
  
  try {
    const user = JSON.parse(userParam);
    
    // Here you would typically:
    // 1. Store user in database
    // 2. Create session/JWT token
    // 3. Set secure cookies
    
    // For now, redirect to dashboard with success
    const redirectUrl = new URL('/dashboard', getBaseUrl());
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('provider', 'google');
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=callback_failed', getBaseUrl()));
  }
}
