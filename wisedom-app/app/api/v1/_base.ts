import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function validateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'No authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    );
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function errorResponse(error: any, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_SERVER_ERROR',
      },
    },
    { status }
  );
}

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
} 