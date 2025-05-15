import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  // Adjust the filter if your contacts table uses a different field for user ownership
  const { count, error } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('email', 'kyle@sonlin.com');

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ count });
} 