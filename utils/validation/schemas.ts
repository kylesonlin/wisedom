import { z } from 'zod';

// Contact schemas
export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  additionalFields: z.record(z.unknown()).optional(),
});

export const contactUpdateSchema = contactSchema.partial();

// Task schemas
export const taskSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().datetime('Invalid date').optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
  }),
  status: z.enum(['todo', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'Status must be todo, in_progress, or completed' }),
  }),
  contactId: z.string().uuid('Invalid contact ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const taskCreateSchema = taskSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const taskUpdateSchema = taskCreateSchema.partial();

// Task assignment schemas
export const taskAssignmentSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
  assigned_at: z.date()
});

export const taskAssignmentCreateSchema = taskAssignmentSchema.omit({
  id: true,
  assigned_at: true
});

// Task reminder schemas
export const taskReminderSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
  reminder_time: z.string().datetime('Invalid reminder time'),
  status: z.enum(['pending', 'sent', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid reminder status' }),
  }),
  created_at: z.date(),
  updated_at: z.date()
});

export const taskReminderCreateSchema = taskReminderSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const taskReminderUpdateSchema = taskReminderCreateSchema.partial();

// Project schemas
export const projectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  progress: z.number().min(0).max(100),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const projectCreateSchema = projectSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const projectUpdateSchema = projectCreateSchema.partial();

// Project member schemas
export const projectMemberSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
  joined_at: z.string().datetime(),
  users: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    metadata: z.record(z.unknown()).optional()
  }).optional()
});

export const projectMemberCreateSchema = projectMemberSchema.omit({
  id: true,
  joined_at: true
});

// Project milestone schemas
export const projectMilestoneSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const projectMilestoneCreateSchema = projectMilestoneSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const projectMilestoneUpdateSchema = projectMilestoneCreateSchema.partial();

// Project analytics schemas
export const projectAnalyticsSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  date: z.string().datetime(),
  total_tasks: z.number().min(0),
  completed_tasks: z.number().min(0),
  total_milestones: z.number().min(0),
  completed_milestones: z.number().min(0),
  active_members: z.number().min(0),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const projectAnalyticsCreateSchema = projectAnalyticsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const projectAnalyticsUpdateSchema = projectAnalyticsCreateSchema.partial();

// Connection schemas
export const connectionSchema = z.object({
  sourceContactId: z.string().uuid('Invalid source contact ID'),
  targetContactId: z.string().uuid('Invalid target contact ID'),
  type: z.enum(['colleague', 'client', 'partner', 'vendor', 'friend', 'family', 'other'], {
    errorMap: () => ({ message: 'Invalid connection type' }),
  }),
  strength: z.number().min(1).max(5),
  notes: z.string().optional(),
});

export const connectionUpdateSchema = connectionSchema.partial();

// Activity schemas
export const activitySchema = z.object({
  type: z.enum([
    'task_created',
    'task_completed',
    'contact_added',
    'contact_updated',
    'project_created',
    'project_updated',
    'meeting_scheduled',
    'note_added'
  ], {
    errorMap: () => ({ message: 'Invalid activity type' }),
  }),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  relatedId: z.string().uuid('Invalid related ID').optional(),
});

// AI suggestion schemas
export const aiSuggestionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['follow_up', 'introduction', 'check_in', 'opportunity', 'risk'], {
    errorMap: () => ({ message: 'Invalid suggestion type' }),
  }),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be high, medium, or low' }),
  }),
  status: z.enum(['pending', 'accepted', 'rejected', 'completed'], {
    errorMap: () => ({ message: 'Invalid suggestion status' }),
  }),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const aiSuggestionCreateSchema = aiSuggestionSchema.omit({
  id: true,
  userId: true,
  status: true,
  created_at: true,
  updated_at: true
});

export const aiSuggestionUpdateSchema = aiSuggestionCreateSchema.partial();

// AI feedback schemas
export const aiFeedbackSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  suggestionId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const aiFeedbackCreateSchema = aiFeedbackSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const aiFeedbackUpdateSchema = aiFeedbackCreateSchema.partial();

// AI analysis schemas
export const aiAnalysisSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['relationship', 'activity', 'communication', 'opportunity'], {
    errorMap: () => ({ message: 'Invalid analysis type' }),
  }),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const aiAnalysisCreateSchema = aiAnalysisSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const aiAnalysisUpdateSchema = aiAnalysisCreateSchema.partial();

// Security event schemas
export const securityEventSchema = z.object({
  type: z.enum(['login', 'logout', 'password_change', 'permission_change'], {
    errorMap: () => ({ message: 'Invalid event type' }),
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Invalid severity level' }),
  }),
  details: z.record(z.unknown()),
  ip: z.string().ip('Invalid IP address'),
  userAgent: z.string(),
});

// Security alert schemas
export const securityAlertSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  type: z.enum(['suspicious_activity', 'failed_login', 'rate_limit', 'permission_change'], {
    errorMap: () => ({ message: 'Invalid alert type' }),
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Invalid severity level' }),
  }),
  status: z.enum(['active', 'resolved', 'investigating'], {
    errorMap: () => ({ message: 'Invalid alert status' }),
  }),
  details: z.record(z.unknown()),
});

// Contact group schemas
export const contactGroupSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Group name is required').max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const contactGroupCreateSchema = contactGroupSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});

export const contactGroupUpdateSchema = contactGroupCreateSchema.partial();

// Contact group member schemas
export const contactGroupMemberSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  contactId: z.string().uuid(),
  addedAt: z.date()
});

export const contactGroupMemberCreateSchema = contactGroupMemberSchema.omit({
  id: true,
  addedAt: true
});

// Contact tag schemas
export const contactTagSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Tag name is required').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const contactTagCreateSchema = contactTagSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});

export const contactTagUpdateSchema = contactTagCreateSchema.partial();

// Contact tag assignment schemas
export const contactTagAssignmentSchema = z.object({
  id: z.string().uuid(),
  tagId: z.string().uuid(),
  contactId: z.string().uuid(),
  assignedAt: z.date()
});

export const contactTagAssignmentCreateSchema = contactTagAssignmentSchema.omit({
  id: true,
  assignedAt: true
});

// Contact Import/Export Schemas
export const contactImportExportHistorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['import', 'export']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  file_name: z.string(),
  file_size: z.number().int().positive(),
  record_count: z.number().int().nonnegative().optional(),
  success_count: z.number().int().nonnegative().optional(),
  error_count: z.number().int().nonnegative().optional(),
  error_details: z.record(z.any()).optional(),
  template_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const contactImportExportHistoryCreateSchema = contactImportExportHistorySchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const contactImportExportHistoryUpdateSchema = contactImportExportHistoryCreateSchema.partial();

export const contactImportExportTemplateSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['import', 'export']),
  field_mappings: z.record(z.string()),
  filters: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const contactImportExportTemplateCreateSchema = contactImportExportTemplateSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const contactImportExportTemplateUpdateSchema = contactImportExportTemplateCreateSchema.partial();

// LinkedIn Integration Schemas
export const linkedinConnectionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  linkedin_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  headline: z.string().optional(),
  profile_url: z.string().url().optional(),
  profile_picture_url: z.string().url().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  connection_strength: z.number().int().min(1).max(3),
  last_interaction: z.string().datetime().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const linkedinConnectionCreateSchema = linkedinConnectionSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const linkedinConnectionUpdateSchema = linkedinConnectionCreateSchema.partial();

export const linkedinActivitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  connection_id: z.string().uuid(),
  type: z.enum(['message', 'post', 'comment', 'reaction', 'profile_view']),
  content: z.string().optional(),
  url: z.string().url().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const linkedinActivityCreateSchema = linkedinActivitySchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const linkedinActivityUpdateSchema = linkedinActivityCreateSchema.partial();

export const linkedinSyncStatusSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  last_sync_at: z.string().datetime().optional(),
  sync_status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  error_message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const linkedinSyncStatusCreateSchema = linkedinSyncStatusSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const linkedinSyncStatusUpdateSchema = linkedinSyncStatusCreateSchema.partial();

// Gmail Integration Schemas
export const gmailEmailSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  gmail_id: z.string(),
  thread_id: z.string(),
  from_email: z.string().email(),
  to_emails: z.array(z.string().email()),
  cc_emails: z.array(z.string().email()).optional(),
  bcc_emails: z.array(z.string().email()).optional(),
  subject: z.string().optional(),
  snippet: z.string().optional(),
  body: z.string().optional(),
  body_html: z.string().optional(),
  labels: z.array(z.string()),
  is_read: z.boolean(),
  is_starred: z.boolean(),
  is_important: z.boolean(),
  received_at: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const gmailEmailCreateSchema = gmailEmailSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const gmailEmailUpdateSchema = gmailEmailCreateSchema.partial();

export const gmailContactSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  photo_url: z.string().url().optional(),
  is_favorite: z.boolean(),
  notes: z.string().optional(),
  labels: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const gmailContactCreateSchema = gmailContactSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const gmailContactUpdateSchema = gmailContactCreateSchema.partial();

export const gmailCalendarEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  event_id: z.string(),
  calendar_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  is_all_day: z.boolean(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  attendees: z.array(z.record(z.unknown())),
  recurrence: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const gmailCalendarEventCreateSchema = gmailCalendarEventSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const gmailCalendarEventUpdateSchema = gmailCalendarEventCreateSchema.partial();

export const gmailSyncStatusSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  last_email_sync_at: z.string().datetime().optional(),
  last_contact_sync_at: z.string().datetime().optional(),
  last_calendar_sync_at: z.string().datetime().optional(),
  email_sync_status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  contact_sync_status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  calendar_sync_status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  error_message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const gmailSyncStatusCreateSchema = gmailSyncStatusSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const gmailSyncStatusUpdateSchema = gmailSyncStatusCreateSchema.partial();

// Calendar Integration Schemas
export const calendarEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  event_id: z.string(),
  calendar_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  is_all_day: z.boolean(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  attendees: z.array(z.record(z.unknown())),
  recurrence: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const calendarEventCreateSchema = calendarEventSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const calendarEventUpdateSchema = calendarEventCreateSchema.partial();

export const calendarAvailabilitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  is_available: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const calendarAvailabilityCreateSchema = calendarAvailabilitySchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const calendarAvailabilityUpdateSchema = calendarAvailabilityCreateSchema.partial();

export const calendarSyncStatusSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  last_sync_at: z.string().datetime().optional(),
  sync_status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  error_message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const calendarSyncStatusCreateSchema = calendarSyncStatusSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const calendarSyncStatusUpdateSchema = calendarSyncStatusCreateSchema.partial();

// OAuth Integration Schemas
export const oauthProviderSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
  auth_url: z.string().url(),
  token_url: z.string().url(),
  scope: z.array(z.string()),
  redirect_uri: z.string().url(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const oauthProviderCreateSchema = oauthProviderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const oauthProviderUpdateSchema = oauthProviderCreateSchema.partial();

export const oauthTokenSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  provider_id: z.string().uuid(),
  access_token: z.string(),
  refresh_token: z.string().optional(),
  token_type: z.string(),
  expires_at: z.string().datetime(),
  scope: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const oauthTokenCreateSchema = oauthTokenSchema.omit({
  id: true,
  userId: true,
  created_at: true,
  updated_at: true
});

export const oauthTokenUpdateSchema = oauthTokenCreateSchema.partial(); 