import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.AUTH_BASE_URL || "https://benkyfy.site";
  }
  return process.env.AUTH_BASE_URL || "http://localhost:3000";
};

const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `${getBaseUrl()}/api/auth/google/callback`,
);

export async function GET(request: NextRequest) {
  // Generate Google OAuth URL
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    redirect_uri: `${getBaseUrl()}/api/auth/google/callback`,
  });

  return NextResponse.redirect(authUrl);
}
