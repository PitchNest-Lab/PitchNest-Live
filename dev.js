const { spawn } = require('child_process');

console.log('🚀 Starting PitchNest-Live Fullstack Dev Environment...');

// Start the backend server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: './backend',
  stdio: 'inherit',
  shell: true
});

// Start the frontend Vite server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: './frontend',
  stdio: 'inherit',
  shell: true
});

// Handle graceful termination on Ctrl+C / process exit
const cleanup = () => {
  console.log('\n🛑 Stopping dev servers...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
