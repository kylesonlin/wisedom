import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/security-events/route';
import { supabase } from '@/utils/supabase';
import { rateLimiter } from '@/utils/rate-limiter';

describe('Security Events API', () => {
  let mockSession: any;
  let mockEvents: any[];

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

    // Setup mock events
    mockEvents = [
      {
        id: 'event-1',
        user_id: 'test-user-id',
        event_type: 'login',
        ip_address: '127.0.0.1',
        details: { browser: 'Chrome' },
        users: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User'
        }
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
      single: vi.fn().mockResolvedValue({ data: mockEvents[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockEvents, error: null, count: 1 })
    }));
  });

  describe('GET /api/v1/security-events', () => {
    it('should return events with pagination', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/security-events?page=1&limit=10');
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

      const req = new NextRequest('http://localhost:3000/api/v1/security-events');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toHaveProperty('error', 'Unauthorized');
    });

    it('should filter events by user ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/security-events?user_id=test-user-id');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data[0].user_id).toBe('test-user-id');
    });
  });

  describe('POST /api/v1/security-events', () => {
    it('should create a new event', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/security-events', {
        method: 'POST',
        body: JSON.stringify({
          event_type: 'login',
          details: { browser: 'Chrome' }
        })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('event_type', 'login');
      expect(data.data).toHaveProperty('ip_address');
    });

    it('should handle invalid request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/security-events', {
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

    it('should automatically add user ID and IP address', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/security-events', {
        method: 'POST',
        body: JSON.stringify({
          event_type: 'login',
          details: { browser: 'Chrome' }
        })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(data.data).toHaveProperty('user_id', 'test-user-id');
      expect(data.data).toHaveProperty('ip_address');
    });
  });
}); 