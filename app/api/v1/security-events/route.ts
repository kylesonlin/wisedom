import { NextRequest, NextResponse } from 'next/server';
import { createSecurityEventSchema, paginationSchema } from '@/utils/validation';
import { ApiError } from '@/utils/api';
import { rateLimiter } from '@/utils/rate-limiter';
import { supabase } from '@/utils/supabase';

// GET /api/v1/security-events - List security events with pagination
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

    // Get user ID from query parameters
    const userId = searchParams.get('user_id');

    // Build query
    let query = supabase
      .from('security_events')
      .select(`
        *,
        users (
          id,
          email,
          full_name
        )
      `, { count: 'exact' });

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Add pagination and sorting
    const { data: events, error, count } = await query
      .range(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit - 1
      )
      .order(pagination.sort_by as string, { ascending: pagination.sort_order === 'asc' });

    if (error) {
      throw new ApiError(500, 'Failed to fetch security events', 'FETCH_ERROR');
    }

    return NextResponse.json({
      data: events,
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

// POST /api/v1/security-events - Create a new security event
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
    const validatedData = createSecurityEventSchema.parse({
      ...body,
      user_id: session.user.id,
      ip_address: ip
    });

    // Create security event
    const { data: event, error } = await supabase
      .from('security_events')
      .insert([validatedData])
      .select(`
        *,
        users (
          id,
          email,
          full_name
        )
      `)
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to create security event', 'CREATE_ERROR');
    }

    return NextResponse.json({ data: event }, { status: 201 });
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