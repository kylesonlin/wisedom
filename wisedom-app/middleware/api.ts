import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ApiError extends Error {
  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

export const withErrorHandler = (handler: Function) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      console.error('API Error:', error);

      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      const code = error.code || 'INTERNAL_SERVER_ERROR';

      res.status(statusCode).json({
        error: {
          message,
          code,
          statusCode,
        },
      });
    }
  };
};

export const withAuth = (handler: Function) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      // Add user to request object
      (req as any).user = session.user;
      
      return handler(req, res);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Authentication failed', 401, 'AUTH_FAILED');
    }
  };
};

export const withRateLimit = (handler: Function, options: {
  windowMs?: number;
  max?: number;
}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100; // 100 requests per windowMs

  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ip) {
      throw new ApiError('Could not determine IP address', 400, 'INVALID_IP');
    }

    const ipStr = Array.isArray(ip) ? ip[0] : ip;
    const requestData = requests.get(ipStr);

    if (requestData) {
      if (now > requestData.resetTime) {
        // Reset if window has passed
        requests.set(ipStr, { count: 1, resetTime: now + windowMs });
      } else if (requestData.count >= max) {
        throw new ApiError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
      } else {
        // Increment count
        requests.set(ipStr, {
          count: requestData.count + 1,
          resetTime: requestData.resetTime,
        });
      }
    } else {
      // First request
      requests.set(ipStr, { count: 1, resetTime: now + windowMs });
    }

    return handler(req, res);
  };
};

// Combine multiple middleware
export const withMiddleware = (
  handler: Function,
  middleware: Array<(handler: Function) => Function>
) => {
  return middleware.reduce((acc, curr) => curr(acc), handler);
}; 