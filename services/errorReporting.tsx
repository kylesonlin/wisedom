import { BaseError, ErrorType } from './errorRecovery';
import { getSupabaseClient } from '../utils/supabase';

interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsByTime: Record<string, number>;
  averageResolutionTime: number;
  recoveryRate: number;
}

interface ErrorNotification {
  type: 'email' | 'slack' | 'webhook';
  recipient: string;
  error: BaseError;
  timestamp: Date;
  status: 'pending' | 'sent' | 'failed';
}

interface ErrorReport {
  type: ErrorType;
  message: string;
  details?: {
    code: string;
    message: string;
    context?: any;
  };
  context?: any;
  timestamp: Date;
  userId?: string | null;
  stackTrace?: string;
}

export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errorCount: number = 0;
  private errorsByType: Map<ErrorType, number> = new Map();
  private errorsByTime: Map<string, number> = new Map();
  private resolutionTimes: number[] = [];
  private resolvedErrors: number = 0;
  private notifications: ErrorNotification[] = [];
  private errorLogs: ErrorReport[] = [];

  private constructor() {}

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  public async reportError(error: BaseError): Promise<void> {
    const errorReport: ErrorReport = {
      type: error.type as ErrorType,
      message: error.message,
      details: error.details,
      timestamp: new Date(),
      stackTrace: error.stack
    };

    this.errorLogs.push(errorReport);
    await this.sendErrorToServer(errorReport);
  }

  private async sendErrorToServer(errorReport: ErrorReport): Promise<void> {
    try {
      // Implement server reporting logic here
      console.log('Sending error report to server:', errorReport);
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  public getErrorLogs(): ErrorReport[] {
    return this.errorLogs;
  }

  public clearErrorLogs(): void {
    this.errorLogs = [];
  }

  public async resolveError(errorId: string, resolutionTime: number): Promise<void> {
    try {
      this.resolvedErrors++;
      this.resolutionTimes.push(resolutionTime);

      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolution_time: resolutionTime,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', errorId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Failed to resolve error:', err);
    }
  }

  public getMetrics(): ErrorMetrics {
    const totalErrors = this.errorCount;
    const errorsByType = Object.fromEntries(this.errorsByType) as Record<ErrorType, number>;
    const errorsByTime = Object.fromEntries(this.errorsByTime);
    const averageResolutionTime = this.resolutionTimes.length > 0
      ? this.resolutionTimes.reduce((a, b) => a + b, 0) / this.resolutionTimes.length
      : 0;
    const recoveryRate = this.errorCount > 0
      ? (this.resolvedErrors / this.errorCount) * 100
      : 0;

    return {
      totalErrors,
      errorsByType,
      errorsByTime,
      averageResolutionTime,
      recoveryRate
    };
  }

  private async sendNotifications(error: BaseError): Promise<void> {
    const notification: ErrorNotification = {
      type: 'email',
      recipient: 'admin@example.com', // Replace with actual admin email
      error,
      timestamp: new Date(),
      status: 'pending'
    };

    try {
      // Send email notification
      await this.sendEmailNotification(notification);
      notification.status = 'sent';
    } catch (err) {
      console.error('Failed to send notification:', err);
      notification.status = 'failed';
    }

    this.notifications.push(notification);
  }

  private async sendEmailNotification(notification: ErrorNotification): Promise<void> {
    // Implement email sending logic here
    // This is a placeholder - replace with actual email service integration
    console.log('Sending email notification:', notification);
  }

  getNotifications(): ErrorNotification[] {
    return this.notifications;
  }

  async getErrorTrends(): Promise<{
    dailyTrends: Record<string, number>;
    typeDistribution: Record<ErrorType, number>;
    recoveryRate: number;
  }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const dailyTrends: Record<string, number> = {};
      const typeDistribution: Record<ErrorType, number> = {
        'IMPORT_ERROR': 0,
        'PROCESSING_ERROR': 0,
        'DATABASE_ERROR': 0,
        'VALIDATION_ERROR': 0
      };
      let recoveredCount = 0;

      data.forEach((error: any) => {
        // Calculate daily trends
        const date = error.timestamp.split('T')[0];
        dailyTrends[date] = (dailyTrends[date] || 0) + 1;

        // Calculate type distribution
        typeDistribution[error.type as ErrorType] = (typeDistribution[error.type as ErrorType] || 0) + 1;

        // Count recovered errors
        if (error.resolved_at) recoveredCount++;
      });

      return {
        dailyTrends,
        typeDistribution,
        recoveryRate: data.length > 0 ? recoveredCount / data.length : 0
      };
    } catch (err) {
      console.error('Failed to get error trends:', err);
      throw err;
    }
  }
} 