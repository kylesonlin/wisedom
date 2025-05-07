import rateLimit from 'express-rate-limit';
import { NextApiRequest, NextApiResponse } from 'next';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export function withRateLimit(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await new Promise((resolve, reject) => {
        rateLimiter(req, res, (result: Error | undefined) => {
          if (result instanceof Error) return reject(result);
          resolve(result);
        });
      });
      return handler(req, res);
    } catch (error) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  };
} 