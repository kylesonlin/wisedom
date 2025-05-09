import { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler, sendSuccess, sendError } from '../_base';
import { ContactsService } from '@/services/contacts';
import { withValidation } from '@/middleware/validation';
import { contactQuerySchema, createContactSchema } from '@/schemas/contacts';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      try {
        const query = (req as any).validatedData;
        const contacts = await ContactsService.getContacts(query);
        return sendSuccess(res, contacts);
      } catch (error: any) {
        return sendError(res, error);
      }

    case 'POST':
      try {
        const data = (req as any).validatedData;
        const contact = await ContactsService.createContact(data);
        return sendSuccess(res, contact, 201);
      } catch (error: any) {
        return sendError(res, error);
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return sendError(res, { message: `Method ${req.method} Not Allowed` }, 405);
  }
};

export default createApiHandler(
  withValidation(contactQuerySchema, { type: 'query' })(
    withValidation(createContactSchema, { type: 'body' })(handler)
  ),
  {
    requireAuth: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
); 