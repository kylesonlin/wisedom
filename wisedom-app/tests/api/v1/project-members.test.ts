import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/v1/project-members/route';
import { supabase } from '@/utils/supabase';
import { rateLimiter } from '@/utils/rate-limiter';

describe('Project Members API', () => {
  let mockSession: any;
  let mockProjects: any[];
  let mockMembers: any[];

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

    // Setup mock projects
    mockProjects = [
      {
        id: 'project-1',
        user_id: 'test-user-id',
        name: 'Test Project'
      }
    ];

    // Setup mock members
    mockMembers = [
      {
        id: 'member-1',
        project_id: 'project-1',
        user_id: 'member-user-id',
        role: 'member',
        users: {
          id: 'member-user-id',
          email: 'member@example.com',
          full_name: 'Test Member',
          avatar_url: null
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
      single: vi.fn().mockResolvedValue({ data: mockMembers[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockMembers, error: null, count: 1 })
    }));
  });

  describe('GET /api/v1/project-members', () => {
    it('should return members with pagination', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/project-members?project_id=project-1&page=1&limit=10');
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

      const req = new NextRequest('http://localhost:3000/api/v1/project-members?project_id=project-1');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toHaveProperty('error', 'Unauthorized');
    });

    it('should require project ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/project-members');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toHaveProperty('error', 'Project ID is required');
    });
  });

  describe('POST /api/v1/project-members', () => {
    it('should add a new member', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/project-members', {
        method: 'POST',
        body: JSON.stringify({
          project_id: 'project-1',
          user_id: 'new-member-id',
          role: 'member'
        })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('role', 'member');
    });

    it('should handle invalid request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/project-members', {
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

    it('should prevent duplicate members', async () => {
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockMembers[0], error: null })
      }));

      const req = new NextRequest('http://localhost:3000/api/v1/project-members', {
        method: 'POST',
        body: JSON.stringify({
          project_id: 'project-1',
          user_id: 'member-user-id',
          role: 'member'
        })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data).toHaveProperty('error', 'User is already a member of this project');
    });
  });

  describe('PATCH /api/v1/project-members', () => {
    it('should update member role', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/project-members', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'member-1',
          project_id: 'project-1',
          role: 'admin'
        })
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('role', 'admin');
    });

    it('should handle non-existent member', async () => {
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      }));

      const req = new NextRequest('http://localhost:3000/api/v1/project-members', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'non-existent',
          project_id: 'project-1',
          role: 'admin'
        })
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toHaveProperty('error', 'Project member not found');
    });
  });

  describe('DELETE /api/v1/project-members', () => {
    it('should remove a member', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/project-members?id=member-1', {
        method: 'DELETE'
      });

      const res = await DELETE(req);
      expect(res.status).toBe(204);
    });

    it('should handle missing member ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/project-members', {
        method: 'DELETE'
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toHaveProperty('error', 'Member ID is required');
    });
  });
}); 