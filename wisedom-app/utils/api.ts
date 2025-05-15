import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit } from './auth';

// API Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Common error codes
export const ErrorCodes = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// Error handler middleware
export const errorHandler = (
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      code: ErrorCodes.INTERNAL_ERROR,
    },
  });
};

// Rate limit middleware
export const rateLimit = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  if (!ip || typeof ip !== 'string') {
    throw new ApiError(
      400,
      'Could not determine client IP',
      ErrorCodes.BAD_REQUEST
    );
  }

  if (!checkRateLimit(ip)) {
    throw new ApiError(
      429,
      'Too many requests',
      ErrorCodes.RATE_LIMIT
    );
  }

  next();
};

// Request validation middleware
export const validateRequest = (
  schema: Record<string, unknown>,
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    // Validate request body
    if (req.body) {
      Object.entries(schema).forEach(([key, type]) => {
        if (req.body[key] === undefined) {
          throw new ApiError(
            400,
            `Missing required field: ${key}`,
            ErrorCodes.BAD_REQUEST
          );
        }

        if (typeof req.body[key] !== type) {
          throw new ApiError(
            400,
            `Invalid type for field: ${key}`,
            ErrorCodes.BAD_REQUEST
          );
        }
      });
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      400,
      'Invalid request',
      ErrorCodes.BAD_REQUEST,
      error
    );
  }
};

// Response wrapper
export const apiResponse = <T>(
  res: NextApiResponse,
  data: T,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    data,
    timestamp: new Date().toISOString(),
  });
};

// API route handler wrapper
export const apiHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      errorHandler(error as Error, req, res, () => {});
    }
  };
}; 