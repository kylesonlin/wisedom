const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to find all .tsx and .jsx files in a directory
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to extract URLs from a file
function extractUrls(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const urlRegex = /(https?:\/\/[^\s"']+)/g;
  const hrefRegex = /href=["']([^"']+)["']/g;
  const srcRegex = /src=["']([^"']+)["']/g;
  
  const urls = new Set();
  
  // Find all URLs
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    urls.add(match[1]);
  }
  
  // Find all href attributes
  while ((match = hrefRegex.exec(content)) !== null) {
    urls.add(match[1]);
  }
  
  // Find all src attributes
  while ((match = srcRegex.exec(content)) !== null) {
    urls.add(match[1]);
  }
  
  return Array.from(urls);
}

// Function to check if a URL is valid
function checkUrl(url) {
  try {
    if (url.startsWith('http')) {
      execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`);
      return true;
    }
    return true; // Local URLs are considered valid
  } catch (error) {
    return false;
  }
}

// Main function
function main() {
  console.log('Checking marketing site...');
  const marketingFiles = findFiles(path.join(__dirname, '../wisedom-marketing/src'));
  const marketingUrls = new Set();
  
  marketingFiles.forEach(file => {
    const urls = extractUrls(file);
    urls.forEach(url => marketingUrls.add(url));
  });
  
  console.log('Checking app...');
  const appFiles = findFiles(path.join(__dirname, '../wisedom-app/app'));
  const appUrls = new Set();
  
  appFiles.forEach(file => {
    const urls = extractUrls(file);
    urls.forEach(url => appUrls.add(url));
  });
  
  // Check URLs
  console.log('\nChecking marketing site URLs...');
  marketingUrls.forEach(url => {
    if (!checkUrl(url)) {
      console.log(`Broken link found in marketing site: ${url}`);
    }
  });
  
  console.log('\nChecking app URLs...');
  appUrls.forEach(url => {
    if (!checkUrl(url)) {
      console.log(`Broken link found in app: ${url}`);
    }
  });
}

main(); 