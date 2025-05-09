import { NextRequest, NextResponse } from 'next/server';
import { createContactInteractionSchema, updateContactInteractionSchema, paginationSchema } from '@/utils/validation';
import { ApiError } from '@/utils/api';
import { rateLimiter } from '@/utils/rate-limiter';
import { supabase } from '@/utils/supabase';

// GET /api/v1/contact-interactions - List interactions with pagination
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

    // Get contact ID from query parameters
    const contactId = searchParams.get('contact_id');

    // Build query
    let query = supabase
      .from('contact_interactions')
      .select(`
        *,
        contacts!inner (
          user_id
        )
      `, { count: 'exact' })
      .eq('contacts.user_id', session.user.id);

    // Filter by contact if specified
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    // Add pagination and sorting
    const { data: interactions, error, count } = await query
      .range(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit - 1
      )
      .order(pagination.sort_by as string, { ascending: pagination.sort_order === 'asc' });

    if (error) {
      throw new ApiError(500, 'Failed to fetch interactions', 'FETCH_ERROR');
    }

    return NextResponse.json({
      data: interactions,
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

// POST /api/v1/contact-interactions - Create a new interaction
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
    const validatedData = createContactInteractionSchema.parse(body);

    // Check if user owns the contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', validatedData.contact_id)
      .eq('user_id', session.user.id)
      .single();

    if (contactError || !contact) {
      throw new ApiError(403, 'Not authorized to create interaction for this contact', 'FORBIDDEN');
    }

    // Create interaction
    const { data: interaction, error } = await supabase
      .from('contact_interactions')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to create interaction', 'CREATE_ERROR');
    }

    return NextResponse.json({ data: interaction }, { status: 201 });
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

// PATCH /api/v1/contact-interactions - Update an interaction
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
    const validatedData = updateContactInteractionSchema.parse(body);

    // Check if user owns the interaction
    const { data: interaction, error: interactionError } = await supabase
      .from('contact_interactions')
      .select(`
        contact_id,
        contacts!inner (
          user_id
        )
      `)
      .eq('id', body.id)
      .single();

    if (interactionError || !interaction) {
      throw new ApiError(404, 'Interaction not found', 'NOT_FOUND');
    }

    if (interaction.contacts[0].user_id !== session.user.id) {
      throw new ApiError(403, 'Not authorized to update this interaction', 'FORBIDDEN');
    }

    // Update interaction
    const { data: updatedInteraction, error } = await supabase
      .from('contact_interactions')
      .update(validatedData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update interaction', 'UPDATE_ERROR');
    }

    return NextResponse.json({ data: updatedInteraction });
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

// DELETE /api/v1/contact-interactions - Delete an interaction
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

    // Get interaction ID from query parameters
    const searchParams = new URL(req.url).searchParams;
    const interactionId = searchParams.get('id');

    if (!interactionId) {
      throw new ApiError(400, 'Interaction ID is required', 'MISSING_ID');
    }

    // Check if user owns the interaction
    const { data: interaction, error: interactionError } = await supabase
      .from('contact_interactions')
      .select(`
        contact_id,
        contacts!inner (
          user_id
        )
      `)
      .eq('id', interactionId)
      .single();

    if (interactionError || !interaction) {
      throw new ApiError(404, 'Interaction not found', 'NOT_FOUND');
    }

    if (interaction.contacts[0].user_id !== session.user.id) {
      throw new ApiError(403, 'Not authorized to delete this interaction', 'FORBIDDEN');
    }

    // Delete interaction
    const { error } = await supabase
      .from('contact_interactions')
      .delete()
      .eq('id', interactionId);

    if (error) {
      throw new ApiError(500, 'Failed to delete interaction', 'DELETE_ERROR');
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