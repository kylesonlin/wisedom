import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/v1/contact-relationships/route';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn()
  },
  from: vi.fn()
};

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

describe('Contact Relationships API', () => {
  let mockSession: any;
  let mockContacts: any[];
  let mockRelationships: any[];

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock session
    mockSession = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com'
      }
    };

    // Setup mock contacts
    mockContacts = [
      {
        id: 'contact-1',
        user_id: 'test-user-id',
        name: 'Contact 1'
      },
      {
        id: 'contact-2',
        user_id: 'test-user-id',
        name: 'Contact 2'
      }
    ];

    // Setup mock relationships
    mockRelationships = [
      {
        id: 'rel-1',
        contact_id: 'contact-1',
        related_contact_id: 'contact-2',
        relationship_type: 'friend',
        contacts: [{ user_id: 'test-user-id' }],
        related_contacts: [{ user_id: 'test-user-id' }]
      }
    ];

    // Mock Supabase auth
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    // Mock Supabase queries
    mockSupabase.from.mockImplementation((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockRelationships[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockRelationships, error: null, count: 1 })
    }));
  });

  describe('GET /api/v1/contact-relationships', () => {
    it('should return relationships with pagination', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-relationships?page=1&limit=10');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page', 1);
      expect(data.pagination).toHaveProperty('limit', 10);
    });

    it('should handle unauthorized requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const req = new NextRequest('http://localhost:3000/api/v1/contact-relationships');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('POST /api/v1/contact-relationships', () => {
    it('should create a new relationship', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-relationships', {
        method: 'POST',
        body: JSON.stringify({
          contact_id: 'contact-1',
          related_contact_id: 'contact-2',
          relationship_type: 'friend'
        })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('relationship_type', 'friend');
    });

    it('should handle invalid request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-relationships', {
        method: 'POST',
        body: JSON.stringify({
          invalid_field: 'value'
        })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('PATCH /api/v1/contact-relationships', () => {
    it('should update an existing relationship', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-relationships', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'rel-1',
          relationship_type: 'colleague'
        })
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('relationship_type', 'colleague');
    });

    it('should handle non-existent relationship', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      }));

      const req = new NextRequest('http://localhost:3000/api/v1/contact-relationships', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'non-existent',
          relationship_type: 'colleague'
        })
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toHaveProperty('error', 'Relationship not found');
    });
  });

  describe('DELETE /api/v1/contact-relationships', () => {
    it('should delete a relationship', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-relationships?id=rel-1', {
        method: 'DELETE'
      });

      const res = await DELETE(req);
      expect(res.status).toBe(204);
    });

    it('should handle missing relationship ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-relationships', {
        method: 'DELETE'
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toHaveProperty('error', 'Relationship ID is required');
    });
  });
}); 