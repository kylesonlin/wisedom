import { NextRequest, NextResponse } from 'next/server';
import { securityMonitoring } from '@/services/security-monitoring';

function determineSeverity(report: any): 'low' | 'medium' | 'high' | 'critical' {
  const directive = report['violated-directive'];
  const blockedUri = report['blocked-uri'];

  // Critical: Script or connect-src violations
  if (directive.startsWith('script-src') || directive.startsWith('connect-src')) {
    return 'critical';
  }

  // High: Style or img-src violations
  if (directive.startsWith('style-src') || directive.startsWith('img-src')) {
    return 'high';
  }

  // Medium: Other resource violations
  if (directive.startsWith('font-src') || directive.startsWith('media-src')) {
    return 'medium';
  }

  // Low: Default case
  return 'low';
}

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log the CSP violation
    await securityMonitoring.logEvent({
      type: 'login',
      severity: determineSeverity(report),
      details: {
        message: `CSP Violation: ${report['violated-directive']}`,
        report
      },
      userId: 'system',
      ip,
      userAgent
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 