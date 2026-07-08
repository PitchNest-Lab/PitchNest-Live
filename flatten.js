const fs = require('fs');
const path = require('path');

// Targets to scan: The entire project root (with exclusions handled below)
const targets = [
  '.'
];
const outputFile = 'all_my_code.txt';
let output = '';

function scan(targetPath) {
  const absolutePath = path.resolve(targetPath);
  if (!fs.existsSync(absolutePath)) return;
  const stat = fs.statSync(absolutePath);

  if (stat.isFile()) {
    const ext = path.extname(absolutePath);
    // Grab all relevant code, config, markup, and docs
    if (['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html', '.md', '.txt', '.sh', '.bat'].includes(ext)) {
      output += `\n// Filepath: ${absolutePath}\n\n`;
      output += fs.readFileSync(absolutePath, 'utf-8');
      output += `\n`;
    }
    return;
  }

  const files = fs.readdirSync(absolutePath);
  for (const file of files) {
    const fullPath = path.join(absolutePath, file);
    // Ignore heavy folders, build folders, modules, lockfiles, outputs, and assets
    if (
      fullPath.includes('node_modules') || 
      fullPath.includes('.git') || 
      fullPath.includes('dist') ||
      fullPath.includes('uploads') ||
      fullPath.includes('assets') ||
      fullPath.includes('.vercel') ||
      fullPath.includes('package-lock.json') ||
      fullPath.includes(outputFile)
    ) continue;
    scan(fullPath);
  }
}

console.log('🚀 Gathering all current PitchNest-Live code...');
targets.forEach(scan);

fs.writeFileSync(outputFile, output.trim());
console.log(`✅ Success! All current code is packed into: ${outputFile} (${fs.statSync(outputFile).size} bytes)`);