const { spawn } = require('child_process');
const path = require('path');

// Запуск seed скрипта
const seedProcess = spawn('node', ['-r', 'ts-node/register', 'src/lib/seed.ts'], {
  cwd: __dirname,
  stdio: 'inherit'
});

seedProcess.on('close', (code) => {
  console.log(`Seed process exited with code ${code}`);
});