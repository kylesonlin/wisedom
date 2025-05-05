import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`;

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
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch contacts
    const contactsResponse = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations,photos', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const contactsData = await contactsResponse.json();
    const contacts = contactsData.connections.map((contact: any) => {
      const name = contact.names?.[0]?.displayName || '';
      const email = contact.emailAddresses?.[0]?.value || '';
      const phone = contact.phoneNumbers?.[0]?.value || '';
      const company = contact.organizations?.[0]?.name || '';
      const position = contact.organizations?.[0]?.title || '';
      const imageUrl = contact.photos?.[0]?.url || '';

      return {
        name,
        email,
        phone,
        company,
        position,
        imageUrl,
        source: 'gmail',
        rawData: contact,
      };
    });

    // Save contacts to database
    await supabase.from('contacts').insert(contacts);

    // Redirect back to the contact import page with success message
    res.redirect('/contacts/import?success=true');
  } catch (error) {
    console.error('Gmail callback error:', error);
    res.redirect('/contacts/import?error=import_failed');
  }
} 