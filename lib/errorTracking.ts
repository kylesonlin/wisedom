export function captureError(error: Error | string, context?: Record<string, any>) {
  // In a real implementation, this would send the error to a service like Sentry
  console.error('Error captured:', error, context);
} 