import { NextRequest, NextResponse } from 'next/server';
import { createProjectMemberSchema, updateProjectMemberSchema, paginationSchema } from '@/utils/validation';
import { ApiError } from '@/utils/api';
import { rateLimiter } from '@/utils/rate-limiter';
import { supabase } from '@/utils/supabase';

// GET /api/v1/project-members - List project members with pagination
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

    // Get project ID from query parameters
    const projectId = searchParams.get('project_id');
    if (!projectId) {
      throw new ApiError(400, 'Project ID is required', 'MISSING_PROJECT_ID');
    }

    // Check if user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      throw new ApiError(403, 'Not authorized to access this project', 'FORBIDDEN');
    }

    // Build query
    const { data: members, error, count } = await supabase
      .from('project_members')
      .select(`
        *,
        users (
          id,
          email,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('project_id', projectId)
      .range(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit - 1
      )
      .order(pagination.sort_by as string, { ascending: pagination.sort_order === 'asc' });

    if (error) {
      throw new ApiError(500, 'Failed to fetch project members', 'FETCH_ERROR');
    }

    return NextResponse.json({
      data: members,
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

// POST /api/v1/project-members - Add a new project member
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
    const validatedData = createProjectMemberSchema.parse(body);

    // Check if user is project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', validatedData.project_id)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      throw new ApiError(403, 'Not authorized to add members to this project', 'FORBIDDEN');
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', validatedData.user_id)
      .single();

    if (userError || !user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    // Check if user is already a member
    const { data: existingMember, error: memberError } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', validatedData.project_id)
      .eq('user_id', validatedData.user_id)
      .single();

    if (existingMember) {
      throw new ApiError(409, 'User is already a member of this project', 'CONFLICT');
    }

    // Add member
    const { data: member, error } = await supabase
      .from('project_members')
      .insert([validatedData])
      .select(`
        *,
        users (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to add project member', 'CREATE_ERROR');
    }

    return NextResponse.json({ data: member }, { status: 201 });
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

// PATCH /api/v1/project-members - Update a project member's role
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
    const validatedData = updateProjectMemberSchema.parse(body);

    // Check if user is project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', validatedData.project_id)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      throw new ApiError(403, 'Not authorized to update project members', 'FORBIDDEN');
    }

    // Update member role
    const { data: member, error } = await supabase
      .from('project_members')
      .update({ role: validatedData.role })
      .eq('id', body.id)
      .select(`
        *,
        users (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update project member', 'UPDATE_ERROR');
    }

    return NextResponse.json({ data: member });
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

// DELETE /api/v1/project-members - Remove a project member
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

    // Get member ID from query parameters
    const searchParams = new URL(req.url).searchParams;
    const memberId = searchParams.get('id');

    if (!memberId) {
      throw new ApiError(400, 'Member ID is required', 'MISSING_ID');
    }

    // Check if user is project owner
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select(`
        project_id,
        projects!inner (
          user_id
        )
      `)
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      throw new ApiError(404, 'Project member not found', 'NOT_FOUND');
    }

    if (member.projects[0].user_id !== session.user.id) {
      throw new ApiError(403, 'Not authorized to remove project members', 'FORBIDDEN');
    }

    // Remove member
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      throw new ApiError(500, 'Failed to remove project member', 'DELETE_ERROR');
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