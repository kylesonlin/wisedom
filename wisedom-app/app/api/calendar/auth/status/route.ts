import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: tokenData, error } = await supabase
      .from('calendar_tokens')
      .select('*')
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ authenticated: false });
    }

    // Check if token is expired
    const isExpired = new Date(tokenData.expires_at) < new Date();
    return NextResponse.json({ authenticated: !isExpired });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
} 