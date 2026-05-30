const fs = require('fs');
const path = require('path');

// Targets to scan: The backend server, backend source folder, and frontend source folder
const targets = [
  './backend/server.ts',
  './backend/src',
  './frontend/src'
];
const outputFile = 'all_my_code.txt';
let output = '';

function scan(targetPath) {
  const absolutePath = path.resolve(targetPath);
  if (!fs.existsSync(absolutePath)) return;
  const stat = fs.statSync(absolutePath);

  if (stat.isFile()) {
    const ext = path.extname(absolutePath);
    // Only grab TypeScript, TSX, JS, JSX, and CSS files
    if (['.ts', '.tsx', '.js', '.jsx', '.css'].includes(ext)) {
      output += `\n// Filepath: ${absolutePath}\n\n`;
      output += fs.readFileSync(absolutePath, 'utf-8');
      output += `\n`;
    }
    return;
  }

  const files = fs.readdirSync(absolutePath);
  for (const file of files) {
    const fullPath = path.join(absolutePath, file);
    // Ignore heavy folders, build folders, modules, and assets/images
    if (
      fullPath.includes('node_modules') || 
      fullPath.includes('.git') || 
      fullPath.includes('dist') ||
      fullPath.includes('uploads') ||
      fullPath.includes('assets')
    ) continue;
    scan(fullPath);
  }
}

console.log('🚀 Gathering all current PitchNest-Live code...');
targets.forEach(scan);

fs.writeFileSync(outputFile, output.trim());
console.log(`✅ Success! All current code is packed into: ${outputFile} (${fs.statSync(outputFile).size} bytes)`);