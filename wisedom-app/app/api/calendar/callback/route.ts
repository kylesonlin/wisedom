import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code is required' },
      { status: 400 }
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Store tokens in database
    await supabase
      .from('calendar_tokens')
      .upsert({
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      });

    // Redirect back to the calendar page
    return NextResponse.redirect(new URL('/calendar?success=true', request.url));
  } catch (error) {
    console.error('Calendar callback error:', error);
    return NextResponse.redirect(new URL('/calendar?error=auth_failed', request.url));
  }
} 