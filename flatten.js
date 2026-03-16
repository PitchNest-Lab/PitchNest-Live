const fs = require('fs');
const path = require('path');

// Targets to scan: The backend server and the frontend source folder
const targets = ['./server.ts', './frontend/src'];
const outputFile = 'all_code.txt';
let output = '';

function scan(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);

  if (stat.isFile()) {
    // Only grab TypeScript, TSX, and JavaScript files
    if (target.endsWith('.ts') || target.endsWith('.tsx') || target.endsWith('.js')) {
      output += `\n\n// ==========================================\n`;
      output += `// FILE: ${target}\n`;
      output += `// ==========================================\n\n`;
      output += fs.readFileSync(target, 'utf-8');
    }
    return;
  }

  const files = fs.readdirSync(target);
  for (const file of files) {
    const fullPath = path.join(target, file);
    // Ignore heavy build folders and modules
    if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('dist')) continue;
    scan(fullPath);
  }
}

targets.forEach(scan);
fs.writeFileSync(outputFile, output);
console.log(`✅ Done! Your code is packed into ${outputFile}`);