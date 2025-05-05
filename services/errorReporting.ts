import { ImportError, ImportErrorType } from '../utils/errorHandling';
import { getSupabaseClient } from '../utils/supabase';

interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<ImportErrorType, number>;
  errorsByTime: Record<string, number>;
  averageResolutionTime: number;
  recoveryRate: number;
}

interface ErrorNotification {
  type: 'email' | 'slack' | 'webhook';
  recipient: string;
  error: ImportError;
  timestamp: Date;
  status: 'pending' | 'sent' | 'failed';
}

export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errorCount: number = 0;
  private errorsByType: Map<ImportErrorType, number> = new Map();
  private errorsByTime: Map<string, number> = new Map();
  private resolutionTimes: number[] = [];
  private resolvedErrors: number = 0;
  private notifications: ErrorNotification[] = [];

  private constructor() {}

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  public async reportError(error: ImportError): Promise<void> {
    try {
      this.errorCount++;
      this.errorsByType.set(
        error.type,
        (this.errorsByType.get(error.type) || 0) + 1
      );

      const timeKey = new Date().toISOString().split('T')[0];
      this.errorsByTime.set(
        timeKey,
        (this.errorsByTime.get(timeKey) || 0) + 1
      );

      await this.saveErrorToDatabase(error);
      await this.sendNotifications(error);
    } catch (err) {
      console.error('Failed to report error:', err);
    }
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
    const errorsByType = Object.fromEntries(this.errorsByType) as Record<ImportErrorType, number>;
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

  private async saveErrorToDatabase(error: ImportError): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { error: dbError } = await supabase
        .from('error_logs')
        .insert({
          type: error.type,
          message: error.message,
          details: error.details,
          context: error.context,
          timestamp: error.timestamp,
          user_id: error.userId || null,
          session_id: error.sessionId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          resolved: false
        });

      if (dbError) throw dbError;
    } catch (err) {
      console.error('Failed to save error to database:', err);
      throw err;
    }
  }

  private async sendNotifications(error: ImportError): Promise<void> {
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
    typeDistribution: Record<ImportErrorType, number>;
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
      const typeDistribution: Record<ImportErrorType, number> = {
        [ImportErrorType.FILE_READ]: 0,
        [ImportErrorType.FILE_PARSE]: 0,
        [ImportErrorType.FILE_FORMAT]: 0,
        [ImportErrorType.NORMALIZATION]: 0,
        [ImportErrorType.DUPLICATE_DETECTION]: 0,
        [ImportErrorType.DATABASE]: 0,
        [ImportErrorType.VALIDATION]: 0,
        [ImportErrorType.UNKNOWN]: 0
      };
      let recoveredCount = 0;

      data.forEach((error: any) => {
        // Calculate daily trends
        const date = error.timestamp.split('T')[0];
        dailyTrends[date] = (dailyTrends[date] || 0) + 1;

        // Calculate type distribution
        typeDistribution[error.type] = (typeDistribution[error.type] || 0) + 1;

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