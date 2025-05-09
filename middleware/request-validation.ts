import { NextRequest, NextResponse } from 'next/server';
import { securityMonitoring } from '@/services/security-monitoring';

interface ValidationRule {
  path: string | RegExp;
  method: string;
  validate: (req: NextRequest) => Promise<boolean>;
  errorMessage: string;
}

const validationRules: ValidationRule[] = [
  {
    path: /^\/api\/.*$/,
    method: 'POST',
    validate: async (req: NextRequest) => {
      const contentType = req.headers.get('content-type');
      return contentType?.includes('application/json') || false;
    },
    errorMessage: 'Content-Type must be application/json'
  },
  {
    path: /^\/api\/auth\/.*$/,
    method: 'POST',
    validate: async (req: NextRequest) => {
      const body = await req.json();
      return body.email && body.password;
    },
    errorMessage: 'Email and password are required'
  },
  {
    path: /^\/api\/contacts\/.*$/,
    method: 'POST',
    validate: async (req: NextRequest) => {
      const body = await req.json();
      return body.name && body.email;
    },
    errorMessage: 'Name and email are required'
  }
];

export async function validateRequest(req: NextRequest): Promise<NextResponse | null> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  for (const rule of validationRules) {
    if (
      (typeof rule.path === 'string' ? path === rule.path : rule.path.test(path)) &&
      rule.method === method
    ) {
      try {
        const isValid = await rule.validate(req);
        if (!isValid) {
          await securityMonitoring.logEvent({
            type: 'auth_failure',
            severity: 'medium',
            message: rule.errorMessage,
            metadata: { path, method },
            timestamp: new Date(),
            ip: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
          });

          return new NextResponse(rule.errorMessage, { status: 400 });
        }
      } catch (error) {
        console.error('Request validation error:', error);
        return new NextResponse('Invalid request', { status: 400 });
      }
    }
  }

  return null;
} 