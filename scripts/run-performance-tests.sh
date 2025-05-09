#!/bin/bash

# Configuration
TEST_DIR="./tests/performance"
REPORT_DIR="./reports/performance"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create report directory
mkdir -p "$REPORT_DIR"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$REPORT_DIR/performance-test.log"
}

# Run load test
run_load_test() {
    log_message "Starting load test..."
    
    k6 run \
        --out json="$REPORT_DIR/load-test-$TIMESTAMP.json" \
        --out influxdb=http://localhost:8086/k6 \
        "$TEST_DIR/load-test.js"
    
    if [ $? -eq 0 ]; then
        log_message "Load test completed successfully"
    else
        log_message "ERROR: Load test failed"
        exit 1
    fi
}

# Generate HTML report
generate_report() {
    log_message "Generating HTML report..."
    
    # Convert JSON results to HTML
    cat > "$REPORT_DIR/load-test-$TIMESTAMP.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report - $TIMESTAMP</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 20px 0; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    <div class="summary">
        <h2>Test Summary</h2>
        <p>Date: $(date)</p>
        <p>Test Duration: 8 minutes</p>
        <p>Max Virtual Users: 100</p>
    </div>
    <div class="metric">
        <h2>Response Time Distribution</h2>
        <div id="responseTime"></div>
    </div>
    <div class="metric">
        <h2>Error Rate</h2>
        <div id="errorRate"></div>
    </div>
    <div class="metric">
        <h2>Requests Per Second</h2>
        <div id="rps"></div>
    </div>
    <script>
        // Load and parse JSON data
        fetch('load-test-$TIMESTAMP.json')
            .then(response => response.json())
            .then(data => {
                // Plot response time
                Plotly.newPlot('responseTime', [{
                    y: data.metrics.http_req_duration.values,
                    type: 'box',
                    name: 'Response Time (ms)'
                }]);
                
                // Plot error rate
                Plotly.newPlot('errorRate', [{
                    y: data.metrics.errors.values,
                    type: 'scatter',
                    name: 'Error Rate'
                }]);
                
                // Plot RPS
                Plotly.newPlot('rps', [{
                    y: data.metrics.http_reqs.values,
                    type: 'scatter',
                    name: 'Requests Per Second'
                }]);
            });
    </script>
</body>
</html>
EOF
    
    log_message "HTML report generated successfully"
}

# Main function
main() {
    log_message "Starting performance test suite..."
    
    # Run tests
    run_load_test
    
    # Generate report
    generate_report
    
    log_message "Performance test suite completed successfully"
}

# Run main function
main 