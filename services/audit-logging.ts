import { createClient } from '@supabase/supabase-js';
import { ApiError, ErrorCodes } from '../utils/api';

export type AuditAction =
  | 'user_create'
  | 'user_update'
  | 'user_delete'
  | 'role_change'
  | 'permission_change'
  | 'data_access'
  | 'data_modification'
  | 'security_setting_change'
  | 'export_data';

export type AuditResource = 'user' | 'role' | 'permission' | 'data' | 'security' | 'export';

interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

class AuditLogging {
  private supabase;
  private readonly TABLE_NAME = 'audit_logs';

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async log(
    userId: string,
    action: AuditAction,
    resource: AuditResource,
    details: Record<string, unknown>,
    resourceId?: string
  ): Promise<AuditLog> {
    const { data, error } = await this.supabase
      .from(this.TABLE_NAME)
      .insert([
        {
          userId,
          action,
          resource,
          resourceId,
          details,
          ip: 'system', // TODO: Get actual IP from request
          userAgent: 'system', // TODO: Get actual user agent from request
          createdAt: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new ApiError(
        500,
        'Failed to create audit log',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return data as AuditLog;
  }

  async getLogs(
    filters: {
      userId?: string;
      action?: AuditAction;
      resource?: AuditResource;
      resourceId?: string;
      startDate?: string;
      endDate?: string;
    },
    page = 1,
    limit = 50
  ): Promise<{ logs: AuditLog[]; total: number }> {
    let query = this.supabase
      .from(this.TABLE_NAME)
      .select('*', { count: 'exact' });

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }
    if (filters.resourceId) {
      query = query.eq('resourceId', filters.resourceId);
    }
    if (filters.startDate) {
      query = query.gte('createdAt', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('createdAt', filters.endDate);
    }

    const { data, error, count } = await query
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new ApiError(
        500,
        'Failed to get audit logs',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return {
      logs: data as AuditLog[],
      total: count || 0,
    };
  }

  async exportLogs(
    filters: {
      userId?: string;
      action?: AuditAction;
      resource?: AuditResource;
      resourceId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AuditLog[]> {
    let query = this.supabase
      .from(this.TABLE_NAME)
      .select('*');

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }
    if (filters.resourceId) {
      query = query.eq('resourceId', filters.resourceId);
    }
    if (filters.startDate) {
      query = query.gte('createdAt', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('createdAt', filters.endDate);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      throw new ApiError(
        500,
        'Failed to export audit logs',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return data as AuditLog[];
  }
}

export const auditLogging = new AuditLogging(); 