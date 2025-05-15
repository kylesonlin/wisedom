import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../../utils/supabase';
import { withRateLimit } from '../../../utils/rate-limiter';

// Validate environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`;

interface GoogleContact {
  names?: Array<{ displayName?: string }>;
  emailAddresses?: Array<{ value?: string }>;
  phoneNumbers?: Array<{ value?: string }>;
  organizations?: Array<{ name?: string; title?: string }>;
  photos?: Array<{ url?: string }>;
}

interface NormalizedContact {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  imageUrl: string;
  source: string;
  rawData: GoogleContact;
  createdAt?: string;
  updatedAt?: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state } = req.query;
  const supabase = getSupabaseClient();

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xuwwwuformuurlencoded',
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Store tokens in Supabase
    const { error: updateError } = await supabase
      .from('user_connections')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('user_id', state)
      .eq('provider', 'gmail');

    if (updateError) {
      throw updateError;
    }

    // Redirect to success page
    res.redirect('/settings/connections?success=true');
  } catch (error) {
    console.error('Gmail callback error:', error);
    res.redirect('/settings/connections?error=true');
  }
}

export default withRateLimit(handler); 