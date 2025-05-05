import { ImportError, ImportErrorType } from '../utils/errorHandling';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {} as Record<ImportErrorType, number>,
    errorsByTime: {},
    averageResolutionTime: 0,
    recoveryRate: 0
  };
  private notifications: ErrorNotification[] = [];

  private constructor() {}

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  async reportError(error: ImportError): Promise<void> {
    // Update metrics
    this.updateMetrics(error);

    // Save error to database
    await this.saveErrorToDatabase(error);

    // Send notifications
    await this.sendNotifications(error);
  }

  private updateMetrics(error: ImportError): void {
    this.metrics.totalErrors++;
    
    // Update errors by type
    if (!this.metrics.errorsByType[error.type]) {
      this.metrics.errorsByType[error.type] = 0;
    }
    this.metrics.errorsByType[error.type]++;

    // Update errors by time (hourly)
    const hour = error.timestamp.toISOString().slice(0, 13);
    if (!this.metrics.errorsByTime[hour]) {
      this.metrics.errorsByTime[hour] = 0;
    }
    this.metrics.errorsByTime[hour]++;
  }

  private async saveErrorToDatabase(error: ImportError): Promise<void> {
    try {
      const { data, error: dbError } = await supabase
        .from('error_logs')
        .insert({
          type: error.type,
          message: error.message,
          details: error.details,
          context: error.context,
          timestamp: error.timestamp,
          user_id: 'current_user_id', // Replace with actual user ID
          session_id: 'current_session_id' // Replace with actual session ID
        });

      if (dbError) throw dbError;
    } catch (err) {
      console.error('Failed to save error to database:', err);
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

  getMetrics(): ErrorMetrics {
    return this.metrics;
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
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const dailyTrends: Record<string, number> = {};
      const typeDistribution: Record<ImportErrorType, number> = {};
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