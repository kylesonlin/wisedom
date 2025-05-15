import * as Sentry from '@sentry/nextjs';
import { Replay } from '@sentry/replay';

export class ErrorTrackingService {
  private static instance: ErrorTrackingService;

  private constructor() {
    // Initialize Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
        integrations: [
          new Replay(),
        ],
      });
    }
  }

  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  public captureError(error: Error, context?: Record<string, any>): void {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  public captureMessage(message: string, level: Sentry.SeverityLevel = 'error'): void {
    Sentry.captureMessage(message, {
      level,
    });
  }

  public setUser(user: { id: string; email?: string; username?: string } | null): void {
    Sentry.setUser(user);
  }

  public addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    Sentry.addBreadcrumb(breadcrumb);
  }
} 