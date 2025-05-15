import { createClient } from '@supabase/supabase-js';
import { ApiError, ErrorCodes } from '../utils/api';

interface SecurityEvent {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'password_change' | 'permission_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

interface SecurityAlert {
  id: string;
  eventId: string;
  type: 'suspicious_activity' | 'failed_login' | 'rate_limit' | 'permission_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'investigating';
  details: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}

type EventCallback = (event: SecurityEvent) => void;
type AlertCallback = (alert: SecurityAlert) => void;

class SecurityMonitoring {
  private supabase;
  private readonly EVENTS_TABLE = 'security_events';
  private readonly ALERTS_TABLE = 'security_alerts';
  private readonly MAX_FAILED_LOGINS = 5;
  private readonly LOGIN_WINDOW = 15 * 60 * 1000; // 15 minutes
  private eventSubscriptions: Set<EventCallback> = new Set();
  private alertSubscriptions: Set<AlertCallback> = new Set();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Set up real-time subscriptions
    this.setupRealtimeSubscriptions();
  }

  private setupRealtimeSubscriptions() {
    // Subscribe to security events
    this.supabase
      .channel('security_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: this.EVENTS_TABLE,
        },
        (payload) => {
          const event = payload.new as SecurityEvent;
          this.eventSubscriptions.forEach((callback) => callback(event));
        }
      )
      .subscribe();

    // Subscribe to security alerts
    this.supabase
      .channel('security_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: this.ALERTS_TABLE,
        },
        (payload) => {
          const alert = payload.new as SecurityAlert;
          this.alertSubscriptions.forEach((callback) => callback(alert));
        }
      )
      .subscribe();
  }

  // Subscribe to real-time security events
  subscribeToEvents(callback: EventCallback) {
    this.eventSubscriptions.add(callback);
    return {
      unsubscribe: () => {
        this.eventSubscriptions.delete(callback);
      },
    };
  }

  // Subscribe to real-time security alerts
  subscribeToAlerts(callback: AlertCallback) {
    this.alertSubscriptions.add(callback);
    return {
      unsubscribe: () => {
        this.alertSubscriptions.delete(callback);
      },
    };
  }

  // Log security events
  async logEvent(event: Omit<SecurityEvent, 'id' | 'createdAt'>): Promise<SecurityEvent> {
    const { data, error } = await this.supabase
      .from(this.EVENTS_TABLE)
      .insert([{
        ...event,
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      throw new ApiError(
        500,
        'Failed to log security event',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return data as SecurityEvent;
  }

  // Create security alerts
  async createAlert(alert: Omit<SecurityAlert, 'id' | 'createdAt'>): Promise<SecurityAlert> {
    const { data, error } = await this.supabase
      .from(this.ALERTS_TABLE)
      .insert([{
        ...alert,
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      throw new ApiError(
        500,
        'Failed to create security alert',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return data as SecurityAlert;
  }

  // Check for suspicious activity
  async checkSuspiciousActivity(userId: string, ip: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - this.LOGIN_WINDOW).toISOString();

    const { data: failedLogins, error } = await this.supabase
      .from(this.EVENTS_TABLE)
      .select('*')
      .eq('userId', userId)
      .eq('type', 'login')
      .eq('severity', 'high')
      .gte('createdAt', windowStart);

    if (error) {
      throw new ApiError(
        500,
        'Failed to check suspicious activity',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    if (failedLogins.length >= this.MAX_FAILED_LOGINS) {
      await this.createAlert({
        eventId: failedLogins[0].id,
        type: 'suspicious_activity',
        severity: 'high',
        status: 'active',
        details: {
          failedAttempts: failedLogins.length,
          windowStart,
          ip,
        },
      });

      return true;
    }

    return false;
  }

  // Monitor rate limiting
  async checkRateLimit(userId: string, ip: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minute

    const { data: recentEvents, error } = await this.supabase
      .from(this.EVENTS_TABLE)
      .select('*')
      .eq('userId', userId)
      .gte('createdAt', windowStart);

    if (error) {
      throw new ApiError(
        500,
        'Failed to check rate limit',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    if (recentEvents.length >= 100) { // 100 requests per minute
      await this.createAlert({
        eventId: recentEvents[0].id,
        type: 'rate_limit',
        severity: 'medium',
        status: 'active',
        details: {
          requestCount: recentEvents.length,
          windowStart,
          ip,
        },
      });

      return true;
    }

    return false;
  }

  // Monitor permission changes
  async monitorPermissionChange(
    userId: string,
    targetUserId: string,
    changes: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      userId,
      type: 'permission_change',
      severity: 'high',
      details: {
        targetUserId,
        changes,
      },
      ip: 'system',
      userAgent: 'system',
    });

    await this.createAlert({
      eventId: 'system',
      type: 'permission_change',
      severity: 'high',
      status: 'active',
      details: {
        userId,
        targetUserId,
        changes,
      },
    });
  }

  // Get security events
  async getEvents(
    filters: {
      userId?: string;
      type?: SecurityEvent['type'];
      severity?: SecurityEvent['severity'];
      startDate?: string;
      endDate?: string;
    },
    page = 1,
    limit = 50
  ): Promise<{ events: SecurityEvent[]; total: number }> {
    let query = this.supabase
      .from(this.EVENTS_TABLE)
      .select('*', { count: 'exact' });

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
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
        'Failed to get security events',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return {
      events: data as SecurityEvent[],
      total: count || 0,
    };
  }

  // Get security alerts
  async getAlerts(
    filters: {
      type?: SecurityAlert['type'];
      severity?: SecurityAlert['severity'];
      status?: SecurityAlert['status'];
      startDate?: string;
      endDate?: string;
    },
    page = 1,
    limit = 50
  ): Promise<{ alerts: SecurityAlert[]; total: number }> {
    let query = this.supabase
      .from(this.ALERTS_TABLE)
      .select('*', { count: 'exact' });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
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
        'Failed to get security alerts',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return {
      alerts: data as SecurityAlert[],
      total: count || 0,
    };
  }

  // Export security events
  async exportEvents(
    filters: {
      userId?: string;
      type?: SecurityEvent['type'];
      severity?: SecurityEvent['severity'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<SecurityEvent[]> {
    let query = this.supabase
      .from(this.EVENTS_TABLE)
      .select('*');

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
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
        'Failed to export security events',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return data as SecurityEvent[];
  }

  // Export security alerts
  async exportAlerts(
    filters: {
      type?: SecurityAlert['type'];
      severity?: SecurityAlert['severity'];
      status?: SecurityAlert['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<SecurityAlert[]> {
    let query = this.supabase
      .from(this.ALERTS_TABLE)
      .select('*');

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
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
        'Failed to export security alerts',
        ErrorCodes.INTERNAL_ERROR,
        error
      );
    }

    return data as SecurityAlert[];
  }
}

export const securityMonitoring = new SecurityMonitoring(); 