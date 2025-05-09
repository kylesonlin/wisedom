#!/bin/bash

# Configuration
AUDIT_DIR="./reports/security"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DOMAIN="your-domain.com"

# Create audit directory
mkdir -p "$AUDIT_DIR"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$AUDIT_DIR/security-audit.log"
}

# Run OWASP ZAP scan
run_zap_scan() {
    log_message "Starting OWASP ZAP scan..."
    
    docker run -v $(pwd)/$AUDIT_DIR:/zap/wrk/:rw \
        -t owasp/zap2docker-stable zap-baseline.py \
        -t https://$DOMAIN \
        -g gen.conf \
        -r zap-report-$TIMESTAMP.html
    
    if [ $? -eq 0 ]; then
        log_message "OWASP ZAP scan completed successfully"
    else
        log_message "ERROR: OWASP ZAP scan failed"
        exit 1
    fi
}

# Run dependency audit
run_dependency_audit() {
    log_message "Starting dependency audit..."
    
    # NPM audit
    npm audit --json > "$AUDIT_DIR/npm-audit-$TIMESTAMP.json"
    
    # Snyk scan
    snyk test --json > "$AUDIT_DIR/snyk-scan-$TIMESTAMP.json"
    
    log_message "Dependency audit completed successfully"
}

# Run SSL/TLS scan
run_ssl_scan() {
    log_message "Starting SSL/TLS scan..."
    
    # SSL Labs scan
    curl -s "https://api.ssllabs.com/api/v3/analyze?host=$DOMAIN&startNew=on" > "$AUDIT_DIR/ssl-scan-$TIMESTAMP.json"
    
    # Wait for scan to complete
    sleep 30
    
    # Get results
    curl -s "https://api.ssllabs.com/api/v3/analyze?host=$DOMAIN" > "$AUDIT_DIR/ssl-scan-results-$TIMESTAMP.json"
    
    log_message "SSL/TLS scan completed successfully"
}

# Run container security scan
run_container_scan() {
    log_message "Starting container security scan..."
    
    # Trivy scan
    trivy image --format json --output "$AUDIT_DIR/container-scan-$TIMESTAMP.json" \
        ${DOCKERHUB_USERNAME}/contact-management:latest
    
    log_message "Container security scan completed successfully"
}

# Generate security report
generate_report() {
    log_message "Generating security report..."
    
    cat > "$AUDIT_DIR/security-report-$TIMESTAMP.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Security Audit Report - $TIMESTAMP</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .critical { color: #d32f2f; }
        .high { color: #f44336; }
        .medium { color: #ff9800; }
        .low { color: #4caf50; }
    </style>
</head>
<body>
    <h1>Security Audit Report</h1>
    <div class="section">
        <h2>Summary</h2>
        <p>Date: $(date)</p>
        <p>Domain: $DOMAIN</p>
        <p>Scan Duration: $(($(date +%s) - $(date -d "@$TIMESTAMP" +%s))) seconds</p>
    </div>
    
    <div class="section">
        <h2>OWASP ZAP Results</h2>
        <iframe src="zap-report-$TIMESTAMP.html" width="100%" height="600px"></iframe>
    </div>
    
    <div class="section">
        <h2>Dependency Vulnerabilities</h2>
        <div id="npm-audit"></div>
        <div id="snyk-scan"></div>
    </div>
    
    <div class="section">
        <h2>SSL/TLS Configuration</h2>
        <div id="ssl-scan"></div>
    </div>
    
    <div class="section">
        <h2>Container Security</h2>
        <div id="container-scan"></div>
    </div>
    
    <script>
        // Load and parse JSON data
        Promise.all([
            fetch('npm-audit-$TIMESTAMP.json').then(r => r.json()),
            fetch('snyk-scan-$TIMESTAMP.json').then(r => r.json()),
            fetch('ssl-scan-results-$TIMESTAMP.json').then(r => r.json()),
            fetch('container-scan-$TIMESTAMP.json').then(r => r.json())
        ]).then(([npmAudit, snykScan, sslScan, containerScan]) => {
            // Display NPM audit results
            const npmAuditDiv = document.getElementById('npm-audit');
            npmAuditDiv.innerHTML = \`
                <h3>NPM Audit</h3>
                <p>Critical: \${npmAudit.metadata.vulnerabilities.critical || 0}</p>
                <p>High: \${npmAudit.metadata.vulnerabilities.high || 0}</p>
                <p>Medium: \${npmAudit.metadata.vulnerabilities.moderate || 0}</p>
                <p>Low: \${npmAudit.metadata.vulnerabilities.low || 0}</p>
            \`;
            
            // Display Snyk scan results
            const snykScanDiv = document.getElementById('snyk-scan');
            snykScanDiv.innerHTML = \`
                <h3>Snyk Scan</h3>
                <p>Critical: \${snykScan.vulnerabilities.filter(v => v.severity === 'critical').length}</p>
                <p>High: \${snykScan.vulnerabilities.filter(v => v.severity === 'high').length}</p>
                <p>Medium: \${snykScan.vulnerabilities.filter(v => v.severity === 'medium').length}</p>
                <p>Low: \${snykScan.vulnerabilities.filter(v => v.severity === 'low').length}</p>
            \`;
            
            // Display SSL scan results
            const sslScanDiv = document.getElementById('ssl-scan');
            sslScanDiv.innerHTML = \`
                <h3>SSL/TLS Configuration</h3>
                <p>Grade: \${sslScan.endpoints[0].grade}</p>
                <p>Protocols: \${sslScan.endpoints[0].details.protocols.map(p => p.name).join(', ')}</p>
                <p>Cipher Suites: \${sslScan.endpoints[0].details.suites.length}</p>
            \`;
            
            // Display container scan results
            const containerScanDiv = document.getElementById('container-scan');
            containerScanDiv.innerHTML = \`
                <h3>Container Security</h3>
                <p>Critical: \${containerScan.Results[0].Vulnerabilities.filter(v => v.Severity === 'CRITICAL').length}</p>
                <p>High: \${containerScan.Results[0].Vulnerabilities.filter(v => v.Severity === 'HIGH').length}</p>
                <p>Medium: \${containerScan.Results[0].Vulnerabilities.filter(v => v.Severity === 'MEDIUM').length}</p>
                <p>Low: \${containerScan.Results[0].Vulnerabilities.filter(v => v.Severity === 'LOW').length}</p>
            \`;
        });
    </script>
</body>
</html>
EOF
    
    log_message "Security report generated successfully"
}

# Main function
main() {
    log_message "Starting security audit..."
    
    # Run all scans
    run_zap_scan
    run_dependency_audit
    run_ssl_scan
    run_container_scan
    
    # Generate report
    generate_report
    
    log_message "Security audit completed successfully"
}

# Run main function
main 