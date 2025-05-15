import { z } from 'zod';
import { ErrorTrackingService } from './errorTracking';

// Base widget settings schema
const baseWidgetSettingsSchema = z.object({
  position: z.enum(['top', 'bottom', 'left', 'right']).optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  refreshInterval: z.number().min(0).optional(),
  showHeader: z.boolean().optional(),
  showFooter: z.boolean().optional(),
  customStyles: z.record(z.string()).optional(),
});

// Contact card settings schema
const contactCardSettingsSchema = baseWidgetSettingsSchema.extend({
  name: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  lastContact: z.date().optional(),
});

// Network overview settings schema
const networkOverviewSettingsSchema = baseWidgetSettingsSchema.extend({
  connections: z.number().min(0),
  activeContacts: z.number().min(0),
  pendingRequests: z.number().min(0),
  recentActivity: z.array(z.object({
    id: z.string(),
    type: z.enum(['connection', 'message', 'meeting']),
    timestamp: z.date(),
    description: z.string(),
  })),
});

// Relationship strength settings schema
const relationshipStrengthSettingsSchema = baseWidgetSettingsSchema.extend({
  metrics: z.array(z.object({
    contactId: z.string(),
    name: z.string(),
    score: z.number().min(0).max(100),
    lastInteraction: z.date(),
    trend: z.enum(['increasing', 'decreasing', 'stable']),
  })),
});

// Action items settings schema
const actionItemsSettingsSchema = baseWidgetSettingsSchema.extend({
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    dueDate: z.date(),
    completed: z.boolean(),
    assignedTo: z.string().optional(),
    category: z.enum(['follow-up', 'meeting', 'task', 'other']),
  })),
});

// AI suggestions settings schema
const aiSuggestionsSettingsSchema = baseWidgetSettingsSchema.extend({
  suggestions: z.array(z.object({
    id: z.string(),
    contactId: z.string(),
    contactName: z.string(),
    type: z.enum(['email', 'call', 'meeting', 'followup']),
    priority: z.enum(['high', 'medium', 'low']),
    reason: z.string(),
    suggestedAction: z.string(),
    suggestedTime: z.date(),
    confidence: z.number().min(0).max(1).optional(),
    notes: z.string().optional(),
  })),
});

// Widget type to schema mapping
const widgetSchemas = {
  'contact-card': contactCardSettingsSchema,
  'network-overview': networkOverviewSettingsSchema,
  'relationship-strength': relationshipStrengthSettingsSchema,
  'action-items': actionItemsSettingsSchema,
  'ai-suggestions': aiSuggestionsSettingsSchema,
} as const;

export class WidgetValidationService {
  private static instance: WidgetValidationService;
  private errorTracking: ErrorTrackingService;

  private constructor() {
    this.errorTracking = ErrorTrackingService.getInstance();
  }

  public static getInstance(): WidgetValidationService {
    if (!WidgetValidationService.instance) {
      WidgetValidationService.instance = new WidgetValidationService();
    }
    return WidgetValidationService.instance;
  }

  public validateWidgetSettings(type: keyof typeof widgetSchemas, settings: unknown): boolean {
    try {
      const schema = widgetSchemas[type];
      schema.parse(settings);
      return true;
    } catch (error) {
      this.errorTracking.captureError(error as Error, {
        widgetType: type,
        settings,
      });
      return false;
    }
  }

  public getValidationErrors(type: keyof typeof widgetSchemas, settings: unknown): string[] {
    try {
      const schema = widgetSchemas[type];
      schema.parse(settings);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      }
      return ['Unknown validation error'];
    }
  }
} 