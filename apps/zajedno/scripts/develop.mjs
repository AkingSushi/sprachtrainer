import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import electron from 'electron';
import './build-electron.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ root, server: { host: '127.0.0.1', port: 5173, strictPort: false } });
await server.listen();
server.printUrls();
const address = server.httpServer.address();
const environment = { ...process.env, ZAJEDNO_DEV_URL: `http://127.0.0.1:${address.port}/` };
delete environment.ELECTRON_RUN_AS_NODE;
const child = spawn(electron, ['.'], { cwd: root, stdio: 'inherit', env: environment });
child.on('exit', async (code) => { await server.close(); process.exit(code ?? 0); });
child.on('error', async (error) => { console.error(error); await server.close(); process.exit(1); });
process.on('SIGINT', () => child.kill());