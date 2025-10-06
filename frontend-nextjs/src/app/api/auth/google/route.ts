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
  
  if (!code) {
    // Generate Google OAuth URL
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      redirect_uri: `${getBaseUrl()}/api/auth/google/callback`,
    });
    
    return NextResponse.redirect(authUrl);
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
      return NextResponse.json({ error: 'Failed to get user info' }, { status: 400 });
    }
    
    // Create session or JWT token
    const user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
    
    // For now, redirect to dashboard with user info
    const redirectUrl = new URL('/dashboard', getBaseUrl());
    redirectUrl.searchParams.set('user', JSON.stringify(user));
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
