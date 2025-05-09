import { NextRequest, NextResponse } from 'next/server';
import { createTaskSchema, updateTaskSchema, paginationSchema } from '@/utils/validation';
import { ApiError } from '@/utils/api';
import { rateLimiter } from '@/utils/rate-limiter';
import { supabase } from '@/utils/supabase';

// GET /api/v1/tasks - List tasks with pagination
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

    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects!inner (
          project_members!inner (
            user_id
          )
        )
      `, { count: 'exact' })
      .eq('projects.project_members.user_id', session.user.id);

    // Filter by project if specified
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    // Add pagination and sorting
    const { data: tasks, error, count } = await query
      .range(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit - 1
      )
      .order(pagination.sort_by as string, { ascending: pagination.sort_order === 'asc' });

    if (error) {
      throw new ApiError(500, 'Failed to fetch tasks', 'FETCH_ERROR');
    }

    return NextResponse.json({
      data: tasks,
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

// POST /api/v1/tasks - Create a new task
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
    const validatedData = createTaskSchema.parse(body);

    // Check if user has access to the project
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', validatedData.project_id)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !member) {
      throw new ApiError(403, 'Not authorized to create tasks in this project', 'FORBIDDEN');
    }

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{ ...validatedData, user_id: session.user.id }])
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to create task', 'CREATE_ERROR');
    }

    return NextResponse.json({ data: task }, { status: 201 });
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

// PATCH /api/v1/tasks - Update a task
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
    const validatedData = updateTaskSchema.parse(body);

    // Check if user has access to the task's project
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', body.id)
      .single();

    if (taskError || !task) {
      throw new ApiError(404, 'Task not found', 'NOT_FOUND');
    }

    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', task.project_id)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !member) {
      throw new ApiError(403, 'Not authorized to update tasks in this project', 'FORBIDDEN');
    }

    // Update task
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(validatedData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update task', 'UPDATE_ERROR');
    }

    return NextResponse.json({ data: updatedTask });
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

// DELETE /api/v1/tasks - Delete a task
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

    // Get task ID from query parameters
    const searchParams = new URL(req.url).searchParams;
    const taskId = searchParams.get('id');

    if (!taskId) {
      throw new ApiError(400, 'Task ID is required', 'MISSING_ID');
    }

    // Check if user has access to the task's project
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      throw new ApiError(404, 'Task not found', 'NOT_FOUND');
    }

    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', task.project_id)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !member || !['owner', 'admin'].includes(member.role)) {
      throw new ApiError(403, 'Not authorized to delete tasks in this project', 'FORBIDDEN');
    }

    // Delete task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw new ApiError(500, 'Failed to delete task', 'DELETE_ERROR');
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