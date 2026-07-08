/**
 * Socket smoke test — verifies JWT auth on agent/dashboard socket events.
 * Run from backend: npm run smoke:socket
 */
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const frontendClient = path.resolve(__dirname, '../../frontend/node_modules/socket.io-client');
const { io } = require(frontendClient);

const API = process.env.SMOKE_API_URL ?? 'http://localhost:5000';

async function registerBusiness() {
  const email = `socket-smoke-${Date.now()}@test.local`;
  const password = 'SmokeTest@2026!';

  const res = await fetch(`${API}/api/auth/business/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Socket Smoke', email, password }),
  });

  if (!res.ok) throw new Error(`register failed: ${res.status}`);
  const data = await res.json();
  return { token: data.accessToken };
}

function waitForEvent(socket, event, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), timeoutMs);
    socket.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

function connectSocket(auth) {
  return io(API, {
    transports: ['websocket', 'polling'],
    auth,
    reconnection: false,
  });
}

async function main() {
  console.log(`\nSocket smoke test → ${API}\n`);

  const { token } = await registerBusiness();

  const badSocket = connectSocket({});
  await new Promise((resolve) => badSocket.on('connect', resolve));
  badSocket.emit('agent_online');
  const badError = await waitForEvent(badSocket, 'error');
  if (!badError?.message) throw new Error('expected error for unauthenticated agent_online');
  console.log('  ✓ unauthenticated agent_online rejected');
  badSocket.disconnect();

  const goodSocket = connectSocket({ accessToken: token });
  await new Promise((resolve, reject) => {
    goodSocket.on('connect', resolve);
    goodSocket.on('error', reject);
    setTimeout(() => reject(new Error('connect timeout')), 5000);
  });
  goodSocket.emit('join_business');
  await new Promise((r) => setTimeout(r, 500));
  console.log('  ✓ authenticated join_business accepted');
  goodSocket.disconnect();

  console.log('\nSocket smoke checks passed.\n');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
