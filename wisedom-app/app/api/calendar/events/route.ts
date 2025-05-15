import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAccessToken() {
  const { data: tokenData, error } = await supabase
    .from('calendar_tokens')
    .select('*')
    .single();

  if (error || !tokenData) {
    throw new Error('No access token found');
  }

  // Check if token is expired
  if (new Date(tokenData.expires_at) < new Date()) {
    // Refresh token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    });

    const newTokenData = await response.json();

    // Update tokens in database
    await supabase
      .from('calendar_tokens')
      .update({
        access_token: newTokenData.access_token,
        expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
      });

    return newTokenData.access_token;
  }

  return tokenData.access_token;
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();

    // Fetch events from Google Calendar
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
      new URLSearchParams({
        timeMin: new Date().toISOString(),
        maxResults: '10',
        singleEvents: 'true',
        orderBy: 'startTime',
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json({ events: data.items });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const event = await request.json();

    // Create event in Google Calendar
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    const data = await response.json();
    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
} 