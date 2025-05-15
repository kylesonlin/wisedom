import { NextRequest, NextResponse } from 'next/server';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`;

export async function GET(request: NextRequest) {
  const state = Math.random().toString(36).substring(7);
  const scope = 'r_liteprofile r_emailaddress';

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&scope=${scope}`;

  return NextResponse.json({ url: authUrl });
} 