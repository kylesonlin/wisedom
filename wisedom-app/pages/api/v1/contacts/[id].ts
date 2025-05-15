import { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler, sendSuccess, sendError } from '../_base';
import { ContactsService } from '@/services/contacts';
import { withValidation } from '@/middleware/validation';
import { updateContactSchema } from '@/schemas/contacts';
import { z } from 'zod';

const idSchema = z.object({
  id: z.string().uuid('Invalid contact ID'),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = (req as any).validatedData;

  switch (req.method) {
    case 'GET':
      try {
        const contact = await ContactsService.getContactById(id);
        return sendSuccess(res, contact);
      } catch (error: any) {
        return sendError(res, error);
      }

    case 'PUT':
      try {
        const data = (req as any).validatedData;
        const contact = await ContactsService.updateContact({
          id,
          ...data
        });
        return sendSuccess(res, contact);
      } catch (error: any) {
        return sendError(res, error);
      }

    case 'DELETE':
      try {
        await ContactsService.deleteContact(id);
        return sendSuccess(res, null, 204);
      } catch (error: any) {
        return sendError(res, error);
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return sendError(res, { message: `Method ${req.method} Not Allowed` }, 405);
  }
};

export default createApiHandler(
  withValidation(idSchema, { type: 'params' })(
    withValidation(updateContactSchema, { type: 'body' })(handler)
  ),
  {
    requireAuth: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
); 