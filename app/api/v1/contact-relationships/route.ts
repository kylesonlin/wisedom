import { NextRequest, NextResponse } from 'next/server';
import { createContactRelationshipSchema, updateContactRelationshipSchema, paginationSchema } from '@/utils/validation';
import { ApiError } from '@/utils/api';
import { rateLimiter } from '@/utils/rate-limiter';
import { supabase } from '@/utils/supabase';

// GET /api/v1/contact-relationships - List relationships with pagination
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
      .from('contact_relationships')
      .select(`
        *,
        contacts!inner (
          user_id
        ),
        related_contacts!inner (
          user_id
        )
      `, { count: 'exact' })
      .or(`contacts.user_id.eq.${session.user.id},related_contacts.user_id.eq.${session.user.id}`);

    // Filter by contact if specified
    if (contactId) {
      query = query.or(`contact_id.eq.${contactId},related_contact_id.eq.${contactId}`);
    }

    // Add pagination and sorting
    const { data: relationships, error, count } = await query
      .range(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit - 1
      )
      .order(pagination.sort_by as string, { ascending: pagination.sort_order === 'asc' });

    if (error) {
      throw new ApiError(500, 'Failed to fetch relationships', 'FETCH_ERROR');
    }

    return NextResponse.json({
      data: relationships,
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

// POST /api/v1/contact-relationships - Create a new relationship
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
    const validatedData = createContactRelationshipSchema.parse(body);

    // Check if user owns both contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id')
      .in('id', [validatedData.contact_id, validatedData.related_contact_id])
      .eq('user_id', session.user.id);

    if (contactsError || !contacts || contacts.length !== 2) {
      throw new ApiError(403, 'Not authorized to create relationship between these contacts', 'FORBIDDEN');
    }

    // Create relationship
    const { data: relationship, error } = await supabase
      .from('contact_relationships')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to create relationship', 'CREATE_ERROR');
    }

    return NextResponse.json({ data: relationship }, { status: 201 });
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

// PATCH /api/v1/contact-relationships - Update a relationship
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
    const validatedData = updateContactRelationshipSchema.parse(body);

    // Check if user owns the relationship
    const { data: relationship, error: relationshipError } = await supabase
      .from('contact_relationships')
      .select(`
        contact_id,
        related_contact_id,
        contacts!inner (
          user_id
        ),
        related_contacts!inner (
          user_id
        )
      `)
      .eq('id', body.id)
      .single();

    if (relationshipError || !relationship) {
      throw new ApiError(404, 'Relationship not found', 'NOT_FOUND');
    }

    if (relationship.contacts[0].user_id !== session.user.id || 
        relationship.related_contacts[0].user_id !== session.user.id) {
      throw new ApiError(403, 'Not authorized to update this relationship', 'FORBIDDEN');
    }

    // Update relationship
    const { data: updatedRelationship, error } = await supabase
      .from('contact_relationships')
      .update(validatedData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update relationship', 'UPDATE_ERROR');
    }

    return NextResponse.json({ data: updatedRelationship });
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

// DELETE /api/v1/contact-relationships - Delete a relationship
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

    // Get relationship ID from query parameters
    const searchParams = new URL(req.url).searchParams;
    const relationshipId = searchParams.get('id');

    if (!relationshipId) {
      throw new ApiError(400, 'Relationship ID is required', 'MISSING_ID');
    }

    // Check if user owns the relationship
    const { data: relationship, error: relationshipError } = await supabase
      .from('contact_relationships')
      .select(`
        contact_id,
        related_contact_id,
        contacts!inner (
          user_id
        ),
        related_contacts!inner (
          user_id
        )
      `)
      .eq('id', relationshipId)
      .single();

    if (relationshipError || !relationship) {
      throw new ApiError(404, 'Relationship not found', 'NOT_FOUND');
    }

    if (relationship.contacts[0].user_id !== session.user.id || 
        relationship.related_contacts[0].user_id !== session.user.id) {
      throw new ApiError(403, 'Not authorized to delete this relationship', 'FORBIDDEN');
    }

    // Delete relationship
    const { error } = await supabase
      .from('contact_relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) {
      throw new ApiError(500, 'Failed to delete relationship', 'DELETE_ERROR');
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