import { NextApiRequest, NextApiResponse } from 'next';
import { securityMonitoring } from '@/services/security-monitoring';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const report = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Log the CSP violation
    await securityMonitoring.logEvent({
      type: 'csp_violation',
      severity: determineSeverity(report),
      message: `CSP Violation: ${report['violated-directive']}`,
      metadata: report,
      timestamp: new Date(),
      ip: ip as string,
      userAgent: userAgent as string
    });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

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