import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'No authorization header' },
      { status: 401 }
    );
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseClient();
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Error fetching profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'No authorization header' },
      { status: 401 }
    );
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseClient();
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Create a new project
    const { name, description } = await request.json();
    
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (projectError) {
      return NextResponse.json(
        { error: 'Error creating project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 