import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema, updateUserSchema, paginationSchema } from '@/utils/validation';
import { ApiError } from '@/utils/api';
import { rateLimiter } from '@/utils/rate-limiter';
import { supabase } from '@/utils/supabase';

// GET /api/v1/users - List users with pagination
export async function GET(req: NextRequest) {
  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const isAllowed = rateLimiter.isAllowed(ip);
    if (!isAllowed) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimiter.getRemainingTokens(ip).toString(),
        },
      });
    }

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = new URL(req.url).searchParams;
    const pagination = paginationSchema.parse({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: searchParams.get('sort_order') || 'desc'
    });

    // Query users with pagination
    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit - 1
      )
      .order(pagination.sort_by as string, { ascending: pagination.sort_order === 'asc' });

    if (error) {
      throw new ApiError(500, 'Failed to fetch users', 'FETCH_ERROR');
    }

    return NextResponse.json({
      data: users,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / pagination.limit)
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const isAllowed = rateLimiter.isAllowed(ip);
    if (!isAllowed) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimiter.getRemainingTokens(ip).toString(),
        },
      });
    }

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createUserSchema.parse(body);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to create user', 'CREATE_ERROR');
    }

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/users - Update a user
export async function PATCH(req: NextRequest) {
  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const isAllowed = rateLimiter.isAllowed(ip);
    if (!isAllowed) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimiter.getRemainingTokens(ip).toString(),
        },
      });
    }

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update(validatedData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update user', 'UPDATE_ERROR');
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/users - Delete a user
export async function DELETE(req: NextRequest) {
  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const isAllowed = rateLimiter.isAllowed(ip);
    if (!isAllowed) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimiter.getRemainingTokens(ip).toString(),
        },
      });
    }

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID from query parameters
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('id');

    if (!userId) {
      throw new ApiError(400, 'User ID is required', 'MISSING_ID');
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new ApiError(500, 'Failed to delete user', 'DELETE_ERROR');
    }

    return NextResponse.json({ data: null }, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 