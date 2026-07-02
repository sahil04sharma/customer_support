import { createServer } from 'http';
import { createApp } from './app';
import { env, validateEnv } from './config/env';
import { initSocket } from './socket/socketHandler';

validateEnv();

const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[server] Port ${env.port} is already in use. Stop the other process or set PORT to a different value in .env`
    );
  } else {
    console.error('[server] Failed to start:', err.message);
  }
  process.exit(1);
});

httpServer.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`);
});
