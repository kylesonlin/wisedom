const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to find all route files in a directory
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'page.tsx' || file === 'page.jsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to convert file path to route path
function filePathToRoute(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath);
  const routePath = relativePath
    .replace(/\/page\.(tsx|jsx)$/, '')
    .replace(/\/\(.*?\)/g, '') // Remove route groups
    .replace(/\[.*?\]/g, ':param') // Convert dynamic segments
    .replace(/\/index$/, '')
    .replace(/^\.\//, '');
  
  return routePath || '/';
}

// Function to verify a route
function verifyRoute(port, route) {
  try {
    const url = `http://localhost:${port}${route}`;
    const status = execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`).toString();
    return status === '200';
  } catch (error) {
    return false;
  }
}

// Main function
function main() {
  console.log('Verifying marketing site routes...');
  const marketingBaseDir = path.join(__dirname, '../wisedom-marketing/src/app');
  const marketingRoutes = findRouteFiles(marketingBaseDir).map(file => filePathToRoute(file, marketingBaseDir));
  
  console.log('\nMarketing site routes:');
  marketingRoutes.forEach(route => {
    console.log(`- ${route}`);
  });
  
  console.log('\nVerifying app routes...');
  const appBaseDir = path.join(__dirname, '../wisedom-app/app');
  const appRoutes = findRouteFiles(appBaseDir).map(file => filePathToRoute(file, appBaseDir));
  
  console.log('\nApp routes:');
  appRoutes.forEach(route => {
    console.log(`- ${route}`);
  });
  
  // Verify routes if servers are running
  console.log('\nVerifying marketing site routes (if server is running)...');
  marketingRoutes.forEach(route => {
    if (!verifyRoute(3003, route)) {
      console.log(`Warning: Route ${route} might not be accessible`);
    }
  });
  
  console.log('\nVerifying app routes (if server is running)...');
  appRoutes.forEach(route => {
    if (!verifyRoute(3002, route)) {
      console.log(`Warning: Route ${route} might not be accessible`);
    }
  });
}

main(); 