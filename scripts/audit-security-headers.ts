const SecurityHeadersAudit = require('../utils/securityHeadersAudit');
const fs = require('fs');
const path = require('path');

interface HeaderAuditResult {
  header: string;
  expected: string;
  actual: string | null;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

async function runSecurityHeadersAudit() {
  try {
    // Get the URL from environment variable or use default
    const url = process.env.AUDIT_URL || 'http://localhost:3000';
    
    // Fetch headers from the URL
    const response = await fetch(url);
    const headers = response.headers;

    // Run the audit
    const audit = new SecurityHeadersAudit(url, headers);
    const report = await audit.audit();

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    // Generate timestamp for the report filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `security-headers-audit-${timestamp}.json`);

    // Write the report to a file
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Print summary to console
    console.log('\nSecurity Headers Audit Report');
    console.log('===========================');
    console.log(`URL: ${report.url}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log('\nSummary:');
    console.log(`Total Headers: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.pass}`);
    console.log(`Failed: ${report.summary.fail}`);
    console.log(`Warnings: ${report.summary.warning}`);
    console.log('\nDetailed Results:');
    
    report.results.forEach((result: HeaderAuditResult) => {
      const statusColor = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
      console.log(`\n${statusColor}${result.header} (${result.status.toUpperCase()})\x1b[0m`);
      console.log(`Message: ${result.message}`);
      if (result.status !== 'pass') {
        console.log(`Expected: ${result.expected}`);
        console.log(`Actual: ${result.actual || 'missing'}`);
      }
    });

    console.log(`\nFull report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(report.summary.fail > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error running security headers audit:', error);
    process.exit(1);
  }
}

runSecurityHeadersAudit(); 