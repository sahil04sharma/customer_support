import { createServer } from 'http';
import { createApp } from './app';
import { env, validateEnv } from './config/env';
import { initSocket } from './socket/socketHandler';

validateEnv();

const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`);
});
