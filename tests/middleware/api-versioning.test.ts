import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { apiVersioningMiddleware, getApiVersion, isVersionSupported, getLatestVersion, isVersionDeprecated, getDeprecationNotice } from '@/middleware/api-versioning';

describe('API Versioning Middleware', () => {
  describe('apiVersioningMiddleware', () => {
    it('should pass through non-API routes', async () => {
      const req = new NextRequest('http://localhost:3000/dashboard');
      const res = await apiVersioningMiddleware(req);
      expect(res.status).toBe(200);
    });

    it('should use default version when no version header is provided', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/users');
      const res = await apiVersioningMiddleware(req);
      expect(res.headers.get('X-API-Version')).toBe('1.0.0');
    });

    it('should accept version from X-API-Version header', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/users', {
        headers: {
          'X-API-Version': '1.0.0'
        }
      });
      const res = await apiVersioningMiddleware(req);
      expect(res.headers.get('X-API-Version')).toBe('1.0.0');
    });

    it('should accept version from Accept header', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/users', {
        headers: {
          'Accept': 'application/vnd.example.v1.0.0+json'
        }
      });
      const res = await apiVersioningMiddleware(req);
      expect(res.headers.get('X-API-Version')).toBe('1.0.0');
    });

    it('should reject unsupported version from X-API-Version header', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/users', {
        headers: {
          'X-API-Version': '2.0.0'
        }
      });
      const res = await apiVersioningMiddleware(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data).toHaveProperty('error', 'Unsupported API version');
    });

    it('should reject unsupported version from Accept header', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/users', {
        headers: {
          'Accept': 'application/vnd.example.v2.0.0+json'
        }
      });
      const res = await apiVersioningMiddleware(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data).toHaveProperty('error', 'Unsupported API version');
    });

    it('should set correct Content-Type header', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/users', {
        headers: {
          'X-API-Version': '1.0.0'
        }
      });
      const res = await apiVersioningMiddleware(req);
      expect(res.headers.get('Content-Type')).toBe('application/vnd.example.v1.0.0+json');
    });
  });

  describe('Helper Functions', () => {
    it('getApiVersion should return version from header', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/users', {
        headers: {
          'X-API-Version': '1.0.0'
        }
      });
      expect(getApiVersion(req)).toBe('1.0.0');
    });

    it('getApiVersion should return default version when no header', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/users');
      expect(getApiVersion(req)).toBe('1.0.0');
    });

    it('isVersionSupported should return true for supported version', () => {
      expect(isVersionSupported('1.0.0')).toBe(true);
    });

    it('isVersionSupported should return false for unsupported version', () => {
      expect(isVersionSupported('2.0.0')).toBe(false);
    });

    it('getLatestVersion should return latest supported version', () => {
      expect(getLatestVersion()).toBe('1.0.0');
    });

    it('isVersionDeprecated should return false for current version', () => {
      expect(isVersionDeprecated('1.0.0')).toBe(false);
    });

    it('getDeprecationNotice should return null for current version', () => {
      expect(getDeprecationNotice('1.0.0')).toBe(null);
    });
  });
}); 