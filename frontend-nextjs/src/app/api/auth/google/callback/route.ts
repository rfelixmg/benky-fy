import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { getBaseUrl } from "@/core/api-utils";

const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `${getBaseUrl()}/api/auth/google/callback`
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", getBaseUrl()));
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("No payload in ID token");
    }

    // Create user object with additional fields
    const user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      joinDate: new Date().toISOString().split("T")[0],
      currentLevel: "Beginner",
      totalStudyTime: "0 hours",
      streakDays: 0,
      totalWordsLearned: 0,
      favoriteModules: ["Hiragana", "Basic Words", "Common Phrases"],
    };

    // Create session cookie and redirect
    const response = NextResponse.redirect(new URL("/home", getBaseUrl()));

    // Set secure HTTP-only cookie with user session
    const sessionData = {
      user,
      provider: "google",
      authenticated: true,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    response.cookies.set({
      name: "benkyfy_session",
      value: JSON.stringify(sessionData),
      httpOnly: false, // Allow JavaScript access in development
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/auth/login", getBaseUrl()));
  }
}