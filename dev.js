const { spawn } = require('child_process');
const net = require('net');

console.log('🚀 Checking PitchNest-Live ports status...');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    server.listen(port, '127.0.0.1');
  });
}

async function main() {
  const isBackendInUse = await checkPort(3000);
  const isFrontendInUse = await checkPort(5174);

  let backendProcess = null;
  let frontendProcess = null;

  if (isBackendInUse && isFrontendInUse) {
    console.log('\n🎉 PitchNest-Live Fullstack is already fully running!');
    console.log('📡 Backend is active on port 3000.');
    console.log('⚡ Frontend is active on port 5174.');
    process.exit(0);
  }

  if (isBackendInUse) {
    console.log('\n📡 Backend is already running on port 3000. Starting only the frontend...');
  } else {
    console.log('\n⚙️ Starting backend server on port 3000...');
    backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: './backend',
      stdio: 'inherit',
      shell: true
    });
  }

  if (isFrontendInUse) {
    console.log('\n⚡ Frontend is already running on port 5174. Starting only the backend...');
  } else {
    console.log('⚙️ Starting frontend Vite server on port 5174...');
    frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: './frontend',
      stdio: 'inherit',
      shell: true
    });
  }

  // Graceful shutdown helper
  const cleanup = () => {
    console.log('\n🛑 Stopping dev servers...');
    if (backendProcess) backendProcess.kill();
    if (frontendProcess) frontendProcess.kill();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  console.error('❌ Error initializing fullstack orchestrator:', err);
});
