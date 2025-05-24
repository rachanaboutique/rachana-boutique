#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Remove console.log statements from a JavaScript/TypeScript file
 * Usage: node remove-console-logs.js <file-path>
 * Example: node remove-console-logs.js ./src/components/MyComponent.jsx
 */

function removeConsoleLogs(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found - ${filePath}`);
      process.exit(1);
    }

    // Create backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`📋 Created backup: ${backupPath}`);

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let cleanedLines = [];
    let removedCount = 0;
    let inMultiLineComment = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let shouldKeepLine = true;

      // Skip if we're in a multi-line comment
      if (inMultiLineComment) {
        if (line.includes('*/')) {
          inMultiLineComment = false;
        }
        cleanedLines.push(line);
        continue;
      }

      // Check for start of multi-line comment
      if (line.includes('/*') && !line.includes('*/')) {
        inMultiLineComment = true;
        cleanedLines.push(line);
        continue;
      }

      // Skip single-line comments that aren't console.log
      if (line.trim().startsWith('//') && !line.includes('console.log')) {
        cleanedLines.push(line);
        continue;
      }

      // More precise regex patterns for console.log detection
      const consoleLogPatterns = [
        // Standard console.log with various content
        /^\s*console\.log\s*\([^;]*\)\s*;?\s*$/,
        // Console.log with string literals
        /^\s*console\.log\s*\(\s*['"`][^'"`;]*['"`]\s*\)\s*;?\s*$/,
        // Console.log with variables
        /^\s*console\.log\s*\(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\)\s*;?\s*$/,
        // Console.log with simple expressions
        /^\s*console\.log\s*\(\s*['"`].*?['"`]\s*,\s*.*?\)\s*;?\s*$/,
        // Console.log with template literals
        /^\s*console\.log\s*\(\s*`.*?`\s*\)\s*;?\s*$/,
      ];

      // Check if line matches any console.log pattern
      for (const pattern of consoleLogPatterns) {
        if (pattern.test(line)) {
          shouldKeepLine = false;
          removedCount++;
          break;
        }
      }

      // Additional check for console.log with balanced parentheses
      if (shouldKeepLine && line.trim().startsWith('console.log(')) {
        let openParens = 0;
        let inString = false;
        let stringDelim = '';

        for (let char of line) {
          if (!inString && (char === '"' || char === "'" || char === '`')) {
            inString = true;
            stringDelim = char;
          } else if (inString && char === stringDelim) {
            inString = false;
            stringDelim = '';
          } else if (!inString) {
            if (char === '(') openParens++;
            if (char === ')') openParens--;
          }
        }

        // If parentheses are balanced and line starts with console.log, remove it
        if (openParens === 0 && line.trim().match(/^console\.log\s*\(/)) {
          shouldKeepLine = false;
          removedCount++;
        }
      }

      if (shouldKeepLine) {
        cleanedLines.push(line);
      }
    }

    // Join lines back together
    let cleanedContent = cleanedLines.join('\n');

    // Clean up excessive empty lines (but preserve intentional spacing)
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n\n');

    // Write the cleaned content back to the file
    fs.writeFileSync(filePath, cleanedContent, 'utf8');

    console.log(`✅ Successfully processed: ${filePath}`);
    console.log(`📊 Removed ${removedCount} console.log statement(s)`);

    if (removedCount === 0) {
      console.log('ℹ️  No console.log statements found in the file');
    } else {
      console.log(`💾 Original file backed up as: ${backupPath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing file: ${error.message}`);
    process.exit(1);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: node remove-console-logs.js <file-path>');
  console.log('Example: node remove-console-logs.js ./src/components/MyComponent.jsx');
  process.exit(1);
}

// Resolve the full path
const fullPath = path.resolve(filePath);

console.log(`🔍 Processing file: ${fullPath}`);
removeConsoleLogs(fullPath);
