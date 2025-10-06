import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.AUTH_BASE_URL || 'https://benkyfy.site';
  }
  return process.env.AUTH_BASE_URL || 'http://localhost:3000';
};

const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `${getBaseUrl()}/api/auth/google/callback`
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=oauth_error', getBaseUrl()));
  }
  
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', getBaseUrl()));
  }
  
  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    // Get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login?error=no_payload', getBaseUrl()));
    }
    
    // Create user object
    const user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
    
    // Redirect to dashboard with user info
    const redirectUrl = new URL('/home', getBaseUrl());
    redirectUrl.searchParams.set('user', JSON.stringify(user));
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('provider', 'google');
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=callback_failed', getBaseUrl()));
  }
}
