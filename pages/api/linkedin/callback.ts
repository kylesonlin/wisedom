import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
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
        code: code as string,
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
    }));

    // Save contacts to database
    await supabase.from('contacts').insert(contacts);

    // Redirect back to the contact import page with success message
    res.redirect('/contacts/import?success=true');
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.redirect('/contacts/import?error=import_failed');
  }
} 