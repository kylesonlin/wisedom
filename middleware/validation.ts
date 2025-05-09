import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { ApiError } from './api';

export const withValidation = <T extends z.ZodType>(
  schema: T,
  options: {
    type: 'body' | 'query' | 'params';
  }
) => {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        let data;
        switch (options.type) {
          case 'body':
            data = req.body;
            break;
          case 'query':
            data = req.query;
            break;
          case 'params':
            data = req.query;
            break;
        }

        const validatedData = await schema.parseAsync(data);
        
        // Add validated data to request object
        (req as any).validatedData = validatedData;
        
        return handler(req, res);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ApiError(
            'Validation Error',
            400,
            'VALIDATION_ERROR',
            error.errors
          );
        }
        throw error;
      }
    };
  };
}; 