#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run tests for a specific browser
run_tests() {
    local browser=$1
    echo -e "${GREEN}Running tests in $browser...${NC}"
    
    # Run Cypress tests for the specified browser
    npx cypress run --browser $browser --spec "cypress/e2e/browser-compatibility.cy.ts"
    
    # Check if tests passed
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Tests passed in $browser${NC}"
    else
        echo -e "${RED}Tests failed in $browser${NC}"
        exit 1
    fi
}

# Start the development server in the background
echo "Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 10

# Run tests for each browser
run_tests "chrome"
run_tests "firefox"
run_tests "edge"

# Kill the development server
echo "Stopping development server..."
kill $DEV_SERVER_PID

echo -e "${GREEN}Browser compatibility tests completed!${NC}" 