const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outputFile = 'all_my_code.txt';
let output = '';

const allowedExts = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', 
  '.css', '.json', '.html', '.md', '.txt', '.sh', 
  '.bat', '.sql', '.prisma', '.mermaid', '.svg', 
  '.yaml', '.yml'
]);

const allowedNames = new Set([
  'Dockerfile', '.dockerignore', '.gcloudignore', '.gitignore', 
  '.env.example', '.env.template', 'vercel.json'
]);

const ignoredPaths = [
  'node_modules', '.git', 'dist', 'uploads', 'assets', 
  '.vercel', 'package-lock.json', outputFile, '.vscode', 
  '.claude', 'render-out', 'tsbuildinfo'
];

function shouldInclude(filename, ext) {
  // STRICT SECURITY CHECK: Never include actual secret .env files (.env, .env.local, etc.)
  if (filename.startsWith('.env') && filename !== '.env.example' && filename !== '.env.template') {
    return false;
  }
  if (allowedNames.has(filename)) return true;
  if (allowedExts.has(ext.toLowerCase())) return true;
  return false;
}

function scan(targetPath) {
  const absolutePath = path.resolve(targetPath);
  if (!fs.existsSync(absolutePath)) return;
  const stat = fs.statSync(absolutePath);

  if (stat.isFile()) {
    const filename = path.basename(absolutePath);
    const ext = path.extname(absolutePath);
    const relPath = path.relative(rootDir, absolutePath).replace(/\\/g, '/');

    if (shouldInclude(filename, ext)) {
      try {
        const content = fs.readFileSync(absolutePath, 'utf-8');
        output += `\n// Filepath: ${relPath}\n\n`;
        output += content;
        output += `\n`;
      } catch (err) {
        console.warn(`Skipping unreadable file: ${relPath}`);
      }
    }
    return;
  }

  const files = fs.readdirSync(absolutePath);
  for (const file of files) {
    const fullPath = path.join(absolutePath, file);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    if (ignoredPaths.some(ignored => relPath.split('/').includes(ignored) || fullPath.endsWith(ignored))) {
      continue;
    }
    scan(fullPath);
  }
}

console.log('🚀 Gathering all current PitchNest-Live backend and frontend code...');
scan('.');

fs.writeFileSync(outputFile, output.trim());
console.log(`✅ Success! All current code is packed into: ${outputFile} (${fs.statSync(outputFile).size} bytes)`);