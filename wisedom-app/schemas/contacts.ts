import { z } from 'zod';

export const createContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const contactQuerySchema = z.object({
  search: z.string().optional(),
  company: z.string().optional(),
  orderBy: z.enum(['first_name', 'last_name', 'email', 'company', 'created_at']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
  limit: z.string().transform(val => parseInt(val)).optional(),
  offset: z.string().transform(val => parseInt(val)).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactQueryInput = z.infer<typeof contactQuerySchema>; 