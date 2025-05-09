const securityHeaders = require('../config/security-headers');

interface HeaderAuditResult {
  header: string;
  expected: string;
  actual: string | null;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

interface SecurityAuditReport {
  timestamp: string;
  url: string;
  results: HeaderAuditResult[];
  summary: {
    total: number;
    pass: number;
    fail: number;
    warning: number;
  };
}

interface PermissionsPolicy {
  [key: string]: string[];
}

interface SecurityHeaders {
  permissionsPolicy: PermissionsPolicy;
  [key: string]: any;
}

module.exports = class SecurityHeadersAudit {
  private url: string;
  private headers: Headers;

  constructor(url: string, headers: Headers) {
    this.url = url;
    this.headers = headers;
  }

  public async audit(): Promise<SecurityAuditReport> {
    const results: HeaderAuditResult[] = [];

    // Audit Content Security Policy
    results.push(this.auditCSP());

    // Audit HSTS
    results.push(this.auditHSTS());

    // Audit X-Frame-Options
    results.push(this.auditXFrameOptions());

    // Audit X-Content-Type-Options
    results.push(this.auditXContentTypeOptions());

    // Audit Referrer Policy
    results.push(this.auditReferrerPolicy());

    // Audit Permissions Policy
    results.push(this.auditPermissionsPolicy());

    // Audit Cross-Origin Policies
    results.push(this.auditCrossOriginResourcePolicy());
    results.push(this.auditCrossOriginOpenerPolicy());
    results.push(this.auditCrossOriginEmbedderPolicy());

    // Audit X-XSS-Protection
    results.push(this.auditXSSProtection());

    // Audit X-DNS-Prefetch-Control
    results.push(this.auditDNSPrefetchControl());

    // Audit Expect-CT
    results.push(this.auditExpectCT());

    // Calculate summary
    const summary = {
      total: results.length,
      pass: results.filter(r => r.status === 'pass').length,
      fail: results.filter(r => r.status === 'fail').length,
      warning: results.filter(r => r.status === 'warning').length
    };

    return {
      timestamp: new Date().toISOString(),
      url: this.url,
      results,
      summary
    };
  }

  private auditCSP(): HeaderAuditResult {
    const actual = this.headers.get('Content-Security-Policy');
    const expected = this.generateCSP();
    
    if (!actual) {
      return {
        header: 'Content-Security-Policy',
        expected,
        actual: null,
        status: 'fail',
        message: 'Content Security Policy header is missing'
      };
    }

    const missingDirectives = this.findMissingCSPDirectives(expected, actual);
    if (missingDirectives.length > 0) {
      return {
        header: 'Content-Security-Policy',
        expected,
        actual,
        status: 'warning',
        message: `Missing directives: ${missingDirectives.join(', ')}`
      };
    }

    return {
      header: 'Content-Security-Policy',
      expected,
      actual,
      status: 'pass',
      message: 'Content Security Policy is properly configured'
    };
  }

  private auditHSTS(): HeaderAuditResult {
    const actual = this.headers.get('Strict-Transport-Security');
    const expected = this.generateHSTS();

    if (!actual) {
      return {
        header: 'Strict-Transport-Security',
        expected,
        actual: null,
        status: 'fail',
        message: 'HSTS header is missing'
      };
    }

    const missingOptions = this.findMissingHSTSOptions(expected, actual);
    if (missingOptions.length > 0) {
      return {
        header: 'Strict-Transport-Security',
        expected,
        actual,
        status: 'warning',
        message: `Missing options: ${missingOptions.join(', ')}`
      };
    }

    return {
      header: 'Strict-Transport-Security',
      expected,
      actual,
      status: 'pass',
      message: 'HSTS is properly configured'
    };
  }

  private auditXFrameOptions(): HeaderAuditResult {
    const actual = this.headers.get('X-Frame-Options');
    const expected = securityHeaders.xFrameOptions;

    if (!actual) {
      return {
        header: 'X-Frame-Options',
        expected,
        actual: null,
        status: 'fail',
        message: 'X-Frame-Options header is missing'
      };
    }

    if (actual !== expected) {
      return {
        header: 'X-Frame-Options',
        expected,
        actual,
        status: 'warning',
        message: 'X-Frame-Options value does not match expected value'
      };
    }

    return {
      header: 'X-Frame-Options',
      expected,
      actual,
      status: 'pass',
      message: 'X-Frame-Options is properly configured'
    };
  }

  private auditXContentTypeOptions(): HeaderAuditResult {
    const actual = this.headers.get('X-Content-Type-Options');
    const expected = securityHeaders.xContentTypeOptions;

    if (!actual) {
      return {
        header: 'X-Content-Type-Options',
        expected,
        actual: null,
        status: 'fail',
        message: 'X-Content-Type-Options header is missing'
      };
    }

    if (actual !== expected) {
      return {
        header: 'X-Content-Type-Options',
        expected,
        actual,
        status: 'warning',
        message: 'X-Content-Type-Options value does not match expected value'
      };
    }

    return {
      header: 'X-Content-Type-Options',
      expected,
      actual,
      status: 'pass',
      message: 'X-Content-Type-Options is properly configured'
    };
  }

  private auditReferrerPolicy(): HeaderAuditResult {
    const actual = this.headers.get('Referrer-Policy');
    const expected = securityHeaders.referrerPolicy;

    if (!actual) {
      return {
        header: 'Referrer-Policy',
        expected,
        actual: null,
        status: 'fail',
        message: 'Referrer-Policy header is missing'
      };
    }

    if (actual !== expected) {
      return {
        header: 'Referrer-Policy',
        expected,
        actual,
        status: 'warning',
        message: 'Referrer-Policy value does not match expected value'
      };
    }

    return {
      header: 'Referrer-Policy',
      expected,
      actual,
      status: 'pass',
      message: 'Referrer-Policy is properly configured'
    };
  }

  private auditPermissionsPolicy(): HeaderAuditResult {
    const actual = this.headers.get('Permissions-Policy');
    const expected = this.generatePermissionsPolicy();

    if (!actual) {
      return {
        header: 'Permissions-Policy',
        expected,
        actual: null,
        status: 'fail',
        message: 'Permissions-Policy header is missing'
      };
    }

    const missingFeatures = this.findMissingPermissionsPolicyFeatures(expected, actual);
    if (missingFeatures.length > 0) {
      return {
        header: 'Permissions-Policy',
        expected,
        actual,
        status: 'warning',
        message: `Missing features: ${missingFeatures.join(', ')}`
      };
    }

    return {
      header: 'Permissions-Policy',
      expected,
      actual,
      status: 'pass',
      message: 'Permissions-Policy is properly configured'
    };
  }

  private auditCrossOriginResourcePolicy(): HeaderAuditResult {
    const actual = this.headers.get('Cross-Origin-Resource-Policy');
    const expected = securityHeaders.crossOriginResourcePolicy;

    if (!actual) {
      return {
        header: 'Cross-Origin-Resource-Policy',
        expected,
        actual: null,
        status: 'fail',
        message: 'Cross-Origin-Resource-Policy header is missing'
      };
    }

    if (actual !== expected) {
      return {
        header: 'Cross-Origin-Resource-Policy',
        expected,
        actual,
        status: 'warning',
        message: 'Cross-Origin-Resource-Policy value does not match expected value'
      };
    }

    return {
      header: 'Cross-Origin-Resource-Policy',
      expected,
      actual,
      status: 'pass',
      message: 'Cross-Origin-Resource-Policy is properly configured'
    };
  }

  private auditCrossOriginOpenerPolicy(): HeaderAuditResult {
    const actual = this.headers.get('Cross-Origin-Opener-Policy');
    const expected = securityHeaders.crossOriginOpenerPolicy;

    if (!actual) {
      return {
        header: 'Cross-Origin-Opener-Policy',
        expected,
        actual: null,
        status: 'fail',
        message: 'Cross-Origin-Opener-Policy header is missing'
      };
    }

    if (actual !== expected) {
      return {
        header: 'Cross-Origin-Opener-Policy',
        expected,
        actual,
        status: 'warning',
        message: 'Cross-Origin-Opener-Policy value does not match expected value'
      };
    }

    return {
      header: 'Cross-Origin-Opener-Policy',
      expected,
      actual,
      status: 'pass',
      message: 'Cross-Origin-Opener-Policy is properly configured'
    };
  }

  private auditCrossOriginEmbedderPolicy(): HeaderAuditResult {
    const actual = this.headers.get('Cross-Origin-Embedder-Policy');
    const expected = securityHeaders.crossOriginEmbedderPolicy;

    if (!actual) {
      return {
        header: 'Cross-Origin-Embedder-Policy',
        expected,
        actual: null,
        status: 'fail',
        message: 'Cross-Origin-Embedder-Policy header is missing'
      };
    }

    if (actual !== expected) {
      return {
        header: 'Cross-Origin-Embedder-Policy',
        expected,
        actual,
        status: 'warning',
        message: 'Cross-Origin-Embedder-Policy value does not match expected value'
      };
    }

    return {
      header: 'Cross-Origin-Embedder-Policy',
      expected,
      actual,
      status: 'pass',
      message: 'Cross-Origin-Embedder-Policy is properly configured'
    };
  }

  private auditXSSProtection(): HeaderAuditResult {
    const actual = this.headers.get('X-XSS-Protection');
    const expected = securityHeaders.xssProtection;

    if (!actual) {
      return {
        header: 'X-XSS-Protection',
        expected,
        actual: null,
        status: 'fail',
        message: 'X-XSS-Protection header is missing'
      };
    }

    if (actual !== expected) {
      return {
        header: 'X-XSS-Protection',
        expected,
        actual,
        status: 'warning',
        message: 'X-XSS-Protection value does not match expected value'
      };
    }

    return {
      header: 'X-XSS-Protection',
      expected,
      actual,
      status: 'pass',
      message: 'X-XSS-Protection is properly configured'
    };
  }

  private auditDNSPrefetchControl(): HeaderAuditResult {
    const actual = this.headers.get('X-DNS-Prefetch-Control');
    const expected = securityHeaders.dnsPrefetchControl;

    if (!actual) {
      return {
        header: 'X-DNS-Prefetch-Control',
        expected,
        actual: null,
        status: 'fail',
        message: 'X-DNS-Prefetch-Control header is missing'
      };
    }

    if (actual !== expected) {
      return {
        header: 'X-DNS-Prefetch-Control',
        expected,
        actual,
        status: 'warning',
        message: 'X-DNS-Prefetch-Control value does not match expected value'
      };
    }

    return {
      header: 'X-DNS-Prefetch-Control',
      expected,
      actual,
      status: 'pass',
      message: 'X-DNS-Prefetch-Control is properly configured'
    };
  }

  private auditExpectCT(): HeaderAuditResult {
    const actual = this.headers.get('Expect-CT');
    const expected = this.generateExpectCT();

    if (!actual) {
      return {
        header: 'Expect-CT',
        expected,
        actual: null,
        status: 'fail',
        message: 'Expect-CT header is missing'
      };
    }

    const missingOptions = this.findMissingExpectCTOptions(expected, actual);
    if (missingOptions.length > 0) {
      return {
        header: 'Expect-CT',
        expected,
        actual,
        status: 'warning',
        message: `Missing options: ${missingOptions.join(', ')}`
      };
    }

    return {
      header: 'Expect-CT',
      expected,
      actual,
      status: 'pass',
      message: 'Expect-CT is properly configured'
    };
  }

  private generateCSP(): string {
    const csp = securityHeaders.contentSecurityPolicy;
    return Object.entries(csp)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key} ${value.join(' ')}`;
        }
        return `${key} ${value}`;
      })
      .join('; ');
  }

  private generateHSTS(): string {
    const hsts = securityHeaders.hsts;
    return `max-age=${hsts.maxAge}${hsts.includeSubDomains ? '; includeSubDomains' : ''}${hsts.preload ? '; preload' : ''}`;
  }

  private generatePermissionsPolicy(): string {
    const policy = (securityHeaders as SecurityHeaders).permissionsPolicy;
    return Object.entries(policy)
      .map(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          return `${key}=()`;
        }
        return `${key}=(${value.join(' ')})`;
      })
      .join(', ');
  }

  private generateExpectCT(): string {
    const expectCt = securityHeaders.expectCt;
    return `max-age=${expectCt.maxAge}${expectCt.enforce ? ', enforce' : ''}${expectCt.reportUri ? `, report-uri="${expectCt.reportUri}"` : ''}`;
  }

  private findMissingCSPDirectives(expected: string, actual: string): string[] {
    const expectedDirectives = new Set(expected.split(';').map(d => d.trim().split(' ')[0]));
    const actualDirectives = new Set(actual.split(';').map(d => d.trim().split(' ')[0]));
    return Array.from(expectedDirectives).filter(d => !actualDirectives.has(d));
  }

  private findMissingHSTSOptions(expected: string, actual: string): string[] {
    const expectedOptions = new Set(expected.split(';').map(o => o.trim()));
    const actualOptions = new Set(actual.split(';').map(o => o.trim()));
    return Array.from(expectedOptions).filter(o => !actualOptions.has(o));
  }

  private findMissingPermissionsPolicyFeatures(expected: string, actual: string): string[] {
    const expectedFeatures = new Set(expected.split(',').map(f => f.trim().split('=')[0]));
    const actualFeatures = new Set(actual.split(',').map(f => f.trim().split('=')[0]));
    return Array.from(expectedFeatures).filter(f => !actualFeatures.has(f));
  }

  private findMissingExpectCTOptions(expected: string, actual: string): string[] {
    const expectedOptions = new Set(expected.split(',').map(o => o.trim()));
    const actualOptions = new Set(actual.split(',').map(o => o.trim()));
    return Array.from(expectedOptions).filter(o => !actualOptions.has(o));
  }
}; 