import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`;

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
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: LINKEDIN_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();

    // Fetch email address
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const emailData = await emailResponse.json();
    const email = emailData.elements[0]['handle~'].emailAddress;

    // Fetch connections
    const connectionsResponse = await fetch('https://api.linkedin.com/v2/connections?q=viewer&start=0&count=100', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const connectionsData = await connectionsResponse.json();
    const now = new Date().toISOString();
    const contacts = connectionsData.elements.map((connection: any) => ({
      name: `${connection.firstName} ${connection.lastName}`,
      email: connection.emailAddress,
      company: connection.company ?? undefined,
      position: connection.position ?? undefined,
      imageUrl: connection.pictureUrl ?? undefined,
      source: 'linkedin',
      rawData: connection,
      createdAt: now,
      updatedAt: now,
      firstName: connection.firstName,
      lastName: connection.lastName,
    }));

    // Save contacts to database
    await supabase.from('contacts').insert(contacts);

    // Redirect back to the contact import page with success message
    return NextResponse.redirect(new URL('/contacts/import?success=true', request.url));
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.redirect(new URL('/contacts/import?error=import_failed', request.url));
  }
} 