import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1).max(255),
  avatar_url: z.string().url().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  two_factor_enabled: z.boolean().default(false),
  two_factor_secret: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const createUserSchema = userSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const updateUserSchema = createUserSchema.partial();

// Contact schemas
export const contactSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  relationship_strength: z.number().min(0).max(100).default(0),
  last_contact_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const createContactSchema = contactSchema.omit({ 
  id: true, 
  user_id: true, 
  created_at: true, 
  updated_at: true 
});

export const updateContactSchema = createContactSchema.partial();

// Project schemas
export const projectSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
  created_at: z.date(),
  updated_at: z.date()
});

export const createProjectSchema = projectSchema.omit({ 
  id: true, 
  user_id: true, 
  created_at: true, 
  updated_at: true 
});

export const updateProjectSchema = createProjectSchema.partial();

// Task schemas
export const taskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  due_date: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  assigned_to: z.string().uuid().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const createTaskSchema = taskSchema.omit({ 
  id: true, 
  user_id: true, 
  created_at: true, 
  updated_at: true 
});

export const updateTaskSchema = createTaskSchema.partial();

// Contact relationship schemas
export const contactRelationshipSchema = z.object({
  id: z.string().uuid(),
  contact_id: z.string().uuid(),
  related_contact_id: z.string().uuid(),
  relationship_type: z.string().min(1).max(50),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const createContactRelationshipSchema = contactRelationshipSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const updateContactRelationshipSchema = createContactRelationshipSchema.partial();

// Contact interaction schemas
export const contactInteractionSchema = z.object({
  id: z.string().uuid(),
  contact_id: z.string().uuid(),
  user_id: z.string().uuid(),
  interaction_type: z.enum(['email', 'call', 'meeting', 'other']),
  notes: z.string().optional(),
  interaction_date: z.date(),
  created_at: z.date(),
  updated_at: z.date()
});

export const createContactInteractionSchema = contactInteractionSchema.omit({ 
  id: true, 
  user_id: true, 
  created_at: true, 
  updated_at: true 
});

export const updateContactInteractionSchema = createContactInteractionSchema.partial();

// Project member schemas
export const projectMemberSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['member', 'admin', 'owner']).default('member'),
  created_at: z.date(),
  updated_at: z.date()
});

export const createProjectMemberSchema = projectMemberSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const updateProjectMemberSchema = createProjectMemberSchema.partial();

// Security event schemas
export const securityEventSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  event_type: z.enum([
    'login',
    'logout',
    'password_change',
    'permission_change',
    'data_access',
    'data_modification',
    'security_setting_change'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  details: z.record(z.unknown()),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  created_at: z.date()
});

export const createSecurityEventSchema = securityEventSchema.omit({ 
  id: true, 
  created_at: true 
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export const searchSchema = z.object({
  query: z.string().min(1),
  fields: z.array(z.string()).optional()
});

// Export types
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Contact = z.infer<typeof contactSchema>;
export type CreateContact = z.infer<typeof createContactSchema>;
export type UpdateContact = z.infer<typeof updateContactSchema>;

export type Project = z.infer<typeof projectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;

export type Task = z.infer<typeof taskSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type ContactRelationship = z.infer<typeof contactRelationshipSchema>;
export type CreateContactRelationship = z.infer<typeof createContactRelationshipSchema>;
export type UpdateContactRelationship = z.infer<typeof updateContactRelationshipSchema>;

export type ContactInteraction = z.infer<typeof contactInteractionSchema>;
export type CreateContactInteraction = z.infer<typeof createContactInteractionSchema>;
export type UpdateContactInteraction = z.infer<typeof updateContactInteractionSchema>;

export type ProjectMember = z.infer<typeof projectMemberSchema>;
export type CreateProjectMember = z.infer<typeof createProjectMemberSchema>;
export type UpdateProjectMember = z.infer<typeof updateProjectMemberSchema>;

export type SecurityEvent = z.infer<typeof securityEventSchema>;
export type CreateSecurityEvent = z.infer<typeof createSecurityEventSchema>; 