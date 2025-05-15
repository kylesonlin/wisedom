import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`;

export async function GET(request: NextRequest) {
  const state = Math.random().toString(36).substring(7);
  const scope = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.settings.readonly'
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&scope=${scope}&access_type=offline&prompt=consent`;

  return NextResponse.json({ url: authUrl });
} 