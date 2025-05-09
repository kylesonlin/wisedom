#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Regex patterns
const pascalCase = /^[A-Z][a-zA-Z0-9]*\.(tsx|ts|jsx|js)$/;
const camelCase = /^[a-z][a-zA-Z0-9]*\.(tsx|ts|js)$/;
const hookCase = /^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/;

// Directories to check
const COMPONENT_DIRS = [
  'components',
  'app/components',
  'components/ui',
  'app/components/new-dashboard/ui',
];
const HOOK_DIRS = [
  'hooks',
  'components/ui',
];
const BACKEND_DIRS = [
  'api',
  'services',
  'backend',
];

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, callback);
    } else {
      callback(filepath);
    }
  });
}

let errors = [];

// Check component files for PascalCase
COMPONENT_DIRS.forEach((dir) => {
  walk(dir, (filepath) => {
    const filename = path.basename(filepath);
    if ((filepath.endsWith('.tsx') || filepath.endsWith('.ts')) && !filename.startsWith('use')) {
      if ((filename === 'index.tsx' || filename === 'index.ts')) return; // Ignore index files
      if (!pascalCase.test(filename)) {
        errors.push(`Component file not PascalCase: ${filepath}`);
      }
    }
  });
});

// Check hooks for camelCase (useXxx)
HOOK_DIRS.forEach((dir) => {
  walk(dir, (filepath) => {
    const filename = path.basename(filepath);
    if (filename.startsWith('use') && (filepath.endsWith('.ts') || filepath.endsWith('.tsx'))) {
      if (!hookCase.test(filename)) {
        errors.push(`Hook file not camelCase (useXxx): ${filepath}`);
      }
    }
  });
});

// Check backend files for camelCase
BACKEND_DIRS.forEach((dir) => {
  walk(dir, (filepath) => {
    const filename = path.basename(filepath);
    if ((filepath.endsWith('.ts') || filepath.endsWith('.js'))) {
      if (!camelCase.test(filename)) {
        errors.push(`Backend file not camelCase: ${filepath}`);
      }
    }
  });
});

if (errors.length > 0) {
  console.error('Filename/case violations found:');
  errors.forEach((e) => console.error('  -', e));
  process.exit(1);
} else {
  console.log('All filenames are correct!');
  process.exit(0);
} 