import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, withErrorHandler, withAuth, withRateLimit } from '@/middleware/api';

export type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export const createApiHandler = (
  handler: ApiHandler,
  options: {
    requireAuth?: boolean;
    rateLimit?: {
      windowMs?: number;
      max?: number;
    };
  } = {}
) => {
  const middleware = [withErrorHandler];

  if (options.requireAuth) {
    middleware.push(withAuth);
  }

  if (options.rateLimit) {
    middleware.push((h) => withRateLimit(h, options.rateLimit!));
  }

  return withMiddleware(handler, middleware);
};

// Common response helpers
export const sendSuccess = (res: NextApiResponse, data: any, statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (res: NextApiResponse, error: any, statusCode: number = 500) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal Server Error',
      code: error.code || 'INTERNAL_SERVER_ERROR',
    },
  });
}; 