import { NextRequest, NextResponse } from 'next/server';
import { createProjectSchema, updateProjectSchema, paginationSchema } from '@/utils/validation';
import { ApiError } from '@/utils/api';
import { rateLimiter } from '@/utils/rate-limiter';
import { supabase } from '@/utils/supabase';

// GET /api/v1/projects - List projects with pagination
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

    // Query projects with pagination
    const { data: projects, error, count } = await supabase
      .from('projects')
      .select(`
        *,
        project_members!inner (
          user_id
        )
      `, { count: 'exact' })
      .eq('project_members.user_id', session.user.id)
      .range(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit - 1
      )
      .order(pagination.sort_by as string, { ascending: pagination.sort_order === 'asc' });

    if (error) {
      throw new ApiError(500, 'Failed to fetch projects', 'FETCH_ERROR');
    }

    return NextResponse.json({
      data: projects,
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

// POST /api/v1/projects - Create a new project
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
    const validatedData = createProjectSchema.parse(body);

    // Start a transaction
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{ ...validatedData, user_id: session.user.id }])
      .select()
      .single();

    if (projectError) {
      throw new ApiError(500, 'Failed to create project', 'CREATE_ERROR');
    }

    // Add user as project owner
    const { error: memberError } = await supabase
      .from('project_members')
      .insert([{
        project_id: project.id,
        user_id: session.user.id,
        role: 'owner'
      }]);

    if (memberError) {
      // Rollback project creation
      await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      throw new ApiError(500, 'Failed to add project member', 'MEMBER_ERROR');
    }

    return NextResponse.json({ data: project }, { status: 201 });
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

// PATCH /api/v1/projects - Update a project
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
    const validatedData = updateProjectSchema.parse(body);

    // Check if user is project owner or admin
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', body.id)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !member || !['owner', 'admin'].includes(member.role)) {
      throw new ApiError(403, 'Not authorized to update project', 'FORBIDDEN');
    }

    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update(validatedData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update project', 'UPDATE_ERROR');
    }

    return NextResponse.json({ data: project });
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

// DELETE /api/v1/projects - Delete a project
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

    // Get project ID from query parameters
    const searchParams = new URL(req.url).searchParams;
    const projectId = searchParams.get('id');

    if (!projectId) {
      throw new ApiError(400, 'Project ID is required', 'MISSING_ID');
    }

    // Check if user is project owner
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !member || member.role !== 'owner') {
      throw new ApiError(403, 'Only project owners can delete projects', 'FORBIDDEN');
    }

    // Delete project (cascade will handle project_members and tasks)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw new ApiError(500, 'Failed to delete project', 'DELETE_ERROR');
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