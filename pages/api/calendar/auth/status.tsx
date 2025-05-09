import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

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

  try {
    const { data: tokenData, error } = await supabase
      .from('calendar_tokens')
      .select('*')
      .single();

    if (error || !tokenData) {
      return res.status(200).json({ authenticated: false });
    }

    // Check if token is expired
    const isExpired = new Date(tokenData.expires_at) < new Date();
    res.status(200).json({ authenticated: !isExpired });
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.status(500).json({ error: 'Failed to check authentication status' });
  }
} 