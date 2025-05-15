import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/v1/contact-interactions/route';
import { supabase } from '@/utils/supabase';
import { rateLimiter } from '@/utils/rate-limiter';

describe('Contact Interactions API', () => {
  let mockSession: any;
  let mockContacts: any[];
  let mockInteractions: any[];

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
      }
    ];

    // Setup mock interactions
    mockInteractions = [
      {
        id: 'interaction-1',
        contact_id: 'contact-1',
        interaction_type: 'meeting',
        notes: 'Test meeting',
        contacts: [{ user_id: 'test-user-id' }]
      }
    ];

    // Mock Supabase auth
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    // Mock Supabase queries
    (supabase.from as any).mockImplementation((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockInteractions[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockInteractions, error: null, count: 1 })
    }));
  });

  describe('GET /api/v1/contact-interactions', () => {
    it('should return interactions with pagination', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions?page=1&limit=10');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page', 1);
      expect(data.pagination).toHaveProperty('limit', 10);
    });

    it('should handle unauthorized requests', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toHaveProperty('error', 'Unauthorized');
    });

    it('should filter interactions by contact ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions?contact_id=contact-1');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data[0].contact_id).toBe('contact-1');
    });
  });

  describe('POST /api/v1/contact-interactions', () => {
    it('should create a new interaction', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions', {
        method: 'POST',
        body: JSON.stringify({
          contact_id: 'contact-1',
          interaction_type: 'meeting',
          notes: 'Test meeting'
        })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('interaction_type', 'meeting');
    });

    it('should handle invalid request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions', {
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

  describe('PATCH /api/v1/contact-interactions', () => {
    it('should update an existing interaction', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'interaction-1',
          notes: 'Updated meeting notes'
        })
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('notes', 'Updated meeting notes');
    });

    it('should handle non-existent interaction', async () => {
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      }));

      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'non-existent',
          notes: 'Updated notes'
        })
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toHaveProperty('error', 'Interaction not found');
    });
  });

  describe('DELETE /api/v1/contact-interactions', () => {
    it('should delete an interaction', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions?id=interaction-1', {
        method: 'DELETE'
      });

      const res = await DELETE(req);
      expect(res.status).toBe(204);
    });

    it('should handle missing interaction ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/contact-interactions', {
        method: 'DELETE'
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toHaveProperty('error', 'Interaction ID is required');
    });
  });
}); 