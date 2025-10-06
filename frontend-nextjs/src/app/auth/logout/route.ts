import { NextRequest, NextResponse } from 'next/server';

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.AUTH_BASE_URL || 'https://benkyfy.site';
  }
  return process.env.AUTH_BASE_URL || 'http://localhost:3000';
};

export async function GET(request: NextRequest) {
  try {
    // Clear user data from localStorage via redirect
    const redirectUrl = new URL('/auth/login', getBaseUrl());
    redirectUrl.searchParams.set('logout', 'success');
    redirectUrl.searchParams.set('clear', 'true');
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=logout_failed', getBaseUrl()));
  }
}
